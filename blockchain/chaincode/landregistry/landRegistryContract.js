'use strict';

let Contract;
try {
  Contract = require('fabric-contract-api').Contract;
} catch (e) {
  Contract = class {
    constructor(name) {
      this.name = name;
    }
  };
}

const ROLES = {
  REGISTRATION_OFFICER: 'REGISTRATION_OFFICER',
  SURVEY_OFFICER: 'SURVEY_OFFICER',
  LAND_OWNER: 'LAND_OWNER',
  BUYER: 'BUYER',
  ADMIN: 'ADMIN'
};

const TITLE_STATUS = {
  ACTIVE: 'ACTIVE',
  DISPUTED: 'DISPUTED'
};

const TRANSFER_STATUS = {
  NONE: 'NONE',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

class LandRegistryContract extends Contract {
  constructor() {
    super('LandRegistryContract');
  }

  // Helper to format ISO timestamp from tx timestamp or fallback
  _getTimestamp(ctx) {
    try {
      const txTimestamp = ctx.stub.getTxTimestamp();
      if (txTimestamp && txTimestamp.seconds) {
        const millis = (txTimestamp.seconds.low || txTimestamp.seconds) * 1000;
        return new Date(millis).toISOString();
      }
    } catch (e) {
      // Fallback
    }
    return new Date().toISOString();
  }

  /**
   * 1. CreateProperty
   * Creates a new property record on the ledger.
   * Only REGISTRATION_OFFICER is authorized.
   */
  async CreateProperty(ctx, parcelId, surveyNumber, ownerId, ownerName, propertyType, documentHash, requestedByRole, officerId) {
    if (requestedByRole !== ROLES.REGISTRATION_OFFICER) {
      throw new Error('Only a Registration Officer can create a property');
    }

    if (!parcelId || !surveyNumber || !ownerId || !ownerName || !propertyType || !documentHash) {
      throw new Error('All required property values (parcelId, surveyNumber, ownerId, ownerName, propertyType, documentHash) must be provided');
    }

    const exists = await this.propertyExists(ctx, parcelId);
    if (exists) {
      throw new Error(`Property with parcel ID ${parcelId} already exists`);
    }

    const now = this._getTimestamp(ctx);

    const property = {
      docType: 'property',
      parcelId,
      surveyNumber,
      ownerId,
      ownerName,
      propertyType,
      documentHash,
      titleStatus: TITLE_STATUS.ACTIVE,
      transferStatus: TRANSFER_STATUS.NONE,
      pendingBuyerId: '',
      pendingBuyerName: '',
      rejectionReason: '',
      createdAt: now,
      updatedAt: now,
      createdBy: officerId || 'OFFICER-001'
    };

    await ctx.stub.putState(parcelId, Buffer.from(JSON.stringify(property)));
    return JSON.stringify(property);
  }

  /**
   * 2. GetProperty
   * Retrieves an existing property by parcelId.
   */
  async GetProperty(ctx, parcelId) {
    if (!parcelId) {
      throw new Error('Parcel ID is required');
    }

    const propertyBytes = await ctx.stub.getState(parcelId);
    if (!propertyBytes || propertyBytes.length === 0) {
      throw new Error(`Property with parcel ID ${parcelId} does not exist`);
    }

    return propertyBytes.toString('utf8');
  }

  /**
   * 3. GetAllProperties
   * Returns all property assets stored in the state database.
   */
  async GetAllProperties(ctx) {
    const allResults = [];
    const iterator = await ctx.stub.getStateByRange('', '');
    let result = await iterator.next();

    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString('utf8'));
      let record;
      try {
        record = JSON.parse(strValue.toString('utf8'));
      } catch (err) {
        record = strValue.toString('utf8');
      }

      if (record && record.docType === 'property') {
        allResults.push(record);
      }
      result = await iterator.next();
    }

    await iterator.close();
    return JSON.stringify(allResults);
  }

  /**
   * 4. RequestTitleTransfer
   * Submits a transfer request to transfer title to a buyer.
   * Only LAND_OWNER who matches current ownerId is authorized.
   */
  async RequestTitleTransfer(ctx, parcelId, currentOwnerId, buyerId, buyerName, requestedByRole) {
    if (requestedByRole !== ROLES.LAND_OWNER) {
      throw new Error('Only a Land Owner can submit a title transfer request');
    }

    const propertyStr = await this.GetProperty(ctx, parcelId);
    const property = JSON.parse(propertyStr);

    if (property.ownerId !== currentOwnerId) {
      throw new Error('Only the current owner can request the transfer');
    }

    if (property.titleStatus === TITLE_STATUS.DISPUTED) {
      throw new Error('Cannot transfer a disputed property');
    }

    if (property.transferStatus === TRANSFER_STATUS.PENDING) {
      throw new Error('A title transfer request is already pending');
    }

    if (!buyerId || !buyerName) {
      throw new Error('Buyer ID and Buyer Name are required for title transfer');
    }

    const now = this._getTimestamp(ctx);

    property.transferStatus = TRANSFER_STATUS.PENDING;
    property.pendingBuyerId = buyerId;
    property.pendingBuyerName = buyerName;
    property.rejectionReason = '';
    property.updatedAt = now;

    await ctx.stub.putState(parcelId, Buffer.from(JSON.stringify(property)));
    return JSON.stringify(property);
  }

  /**
   * 5. ApproveTitleTransfer
   * Approves a pending transfer request.
   * Only REGISTRATION_OFFICER is authorized.
   */
  async ApproveTitleTransfer(ctx, parcelId, requestedByRole, officerId) {
    if (requestedByRole !== ROLES.REGISTRATION_OFFICER) {
      throw new Error('Only a Registration Officer can approve a title transfer');
    }

    const propertyStr = await this.GetProperty(ctx, parcelId);
    const property = JSON.parse(propertyStr);

    if (property.transferStatus !== TRANSFER_STATUS.PENDING) {
      throw new Error('No pending title transfer exists');
    }

    const now = this._getTimestamp(ctx);

    // Update ownership
    property.ownerId = property.pendingBuyerId;
    property.ownerName = property.pendingBuyerName;
    property.transferStatus = TRANSFER_STATUS.APPROVED;
    property.pendingBuyerId = '';
    property.pendingBuyerName = '';
    property.rejectionReason = '';
    property.updatedAt = now;

    await ctx.stub.putState(parcelId, Buffer.from(JSON.stringify(property)));
    return JSON.stringify(property);
  }

  /**
   * 6. RejectTitleTransfer
   * Rejects a pending transfer request with a reason.
   * Only REGISTRATION_OFFICER is authorized.
   */
  async RejectTitleTransfer(ctx, parcelId, reason, requestedByRole, officerId) {
    if (requestedByRole !== ROLES.REGISTRATION_OFFICER) {
      throw new Error('Only a Registration Officer can reject a title transfer');
    }

    const propertyStr = await this.GetProperty(ctx, parcelId);
    const property = JSON.parse(propertyStr);

    if (property.transferStatus !== TRANSFER_STATUS.PENDING) {
      throw new Error('No pending title transfer exists');
    }

    const now = this._getTimestamp(ctx);

    property.transferStatus = TRANSFER_STATUS.REJECTED;
    property.rejectionReason = reason || 'Document verification incomplete';
    property.updatedAt = now;

    await ctx.stub.putState(parcelId, Buffer.from(JSON.stringify(property)));
    return JSON.stringify(property);
  }

  /**
   * 7. GetPropertyHistory
   * Returns the chronological history of changes for a parcel.
   */
  async GetPropertyHistory(ctx, parcelId) {
    if (!parcelId) {
      throw new Error('Parcel ID is required');
    }

    // Check existence first
    await this.GetProperty(ctx, parcelId);

    const historyIterator = await ctx.stub.getHistoryForKey(parcelId);
    const records = [];

    while (true) {
      const res = await historyIterator.next();

      if (res.value && res.value.value.toString()) {
        let parsedValue;
        try {
          parsedValue = JSON.parse(res.value.value.toString('utf8'));
        } catch (err) {
          parsedValue = res.value.value.toString('utf8');
        }

        let isoTimestamp = new Date().toISOString();
        if (res.value.timestamp && res.value.timestamp.seconds) {
          const s = (res.value.timestamp.seconds.low || res.value.timestamp.seconds) * 1000;
          isoTimestamp = new Date(s).toISOString();
        }

        records.push({
          transactionId: res.value.txId,
          timestamp: isoTimestamp,
          isDelete: res.value.isDelete,
          value: parsedValue
        });
      }

      if (res.done) {
        await historyIterator.close();
        break;
      }
    }

    return JSON.stringify(records);
  }

  /**
   * Helper to verify if property exists
   */
  async propertyExists(ctx, parcelId) {
    const propertyBytes = await ctx.stub.getState(parcelId);
    return propertyBytes && propertyBytes.length > 0;
  }
}

module.exports = LandRegistryContract;
