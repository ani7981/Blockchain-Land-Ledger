'use strict';

const crypto = require('crypto');
const LandRegistryContract = require('../../../blockchain/chaincode/landregistry/landRegistryContract');

/**
 * LedgerStore manages an in-memory/persisted ledger state using the official LandRegistryContract.
 * It simulates the Hyperledger Fabric ledger behavior (key-value state, getHistoryForKey, transaction IDs)
 * ensuring exact parity with on-chain chaincode execution.
 */
class LedgerStore {
  constructor() {
    this.contract = new LandRegistryContract();
    this.state = new Map();
    this.history = new Map();
    this.currentTxId = null;
    this._seedInitialData();
  }

  _seedInitialData() {
    // Initial sample properties from data-model.md
    const samples = [
      {
        parcelId: 'TN-CHN-001',
        surveyNumber: '114/2A',
        ownerId: 'OWNER-001',
        ownerName: 'Ravi Kumar',
        propertyType: 'Residential',
        documentHash: '4b2e7c9a11d3',
        requestedByRole: 'REGISTRATION_OFFICER',
        officerId: 'OFFICER-001',
        createdAt: '2026-09-14T12:00:00Z',
        updatedAt: '2026-09-14T12:00:00Z'
      },
      {
        parcelId: 'TN-CHN-002',
        surveyNumber: '216/4B',
        ownerId: 'OWNER-002',
        ownerName: 'Meera Iyer',
        propertyType: 'Commercial',
        documentHash: 'f9354be02d6c',
        requestedByRole: 'REGISTRATION_OFFICER',
        officerId: 'OFFICER-001',
        createdAt: '2026-09-14T12:05:00Z',
        updatedAt: '2026-09-14T12:05:00Z'
      },
      {
        parcelId: 'TN-CHN-003',
        surveyNumber: '88/1',
        ownerId: 'OWNER-003',
        ownerName: 'Suresh Babu',
        propertyType: 'Agricultural',
        documentHash: 'c9b62cf744f1',
        requestedByRole: 'REGISTRATION_OFFICER',
        officerId: 'OFFICER-001',
        createdAt: '2026-09-14T12:10:00Z',
        updatedAt: '2026-09-14T12:10:00Z'
      }
    ];

    for (const s of samples) {
      const prop = {
        docType: 'property',
        parcelId: s.parcelId,
        surveyNumber: s.surveyNumber,
        ownerId: s.ownerId,
        ownerName: s.ownerName,
        propertyType: s.propertyType,
        documentHash: s.documentHash,
        titleStatus: 'ACTIVE',
        transferStatus: 'NONE',
        pendingBuyerId: '',
        pendingBuyerName: '',
        rejectionReason: '',
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        createdBy: s.officerId
      };
      this.state.set(s.parcelId, Buffer.from(JSON.stringify(prop)));
      this.history.set(s.parcelId, [
        {
          transactionId: `TX-GENESIS-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          timestamp: s.createdAt,
          isDelete: false,
          value: prop
        }
      ]);
    }

    // Set sample 2 to PENDING transfer
    const p2 = JSON.parse(this.state.get('TN-CHN-002').toString('utf8'));
    p2.transferStatus = 'PENDING';
    p2.pendingBuyerId = 'BUYER-002';
    p2.pendingBuyerName = 'Arjun Das';
    p2.updatedAt = '2026-09-14T12:15:00Z';
    this.state.set('TN-CHN-002', Buffer.from(JSON.stringify(p2)));
    this.history.get('TN-CHN-002').push({
      transactionId: `TX-TRANSFER-REQ-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      timestamp: '2026-09-14T12:15:00Z',
      isDelete: false,
      value: p2
    });

    // Set sample 3 to REJECTED transfer
    const p3 = JSON.parse(this.state.get('TN-CHN-003').toString('utf8'));
    p3.transferStatus = 'REJECTED';
    p3.pendingBuyerId = 'BUYER-003';
    p3.pendingBuyerName = 'Ananya Roy';
    p3.rejectionReason = 'Survey verification is incomplete';
    p3.updatedAt = '2026-09-14T12:20:00Z';
    this.state.set('TN-CHN-003', Buffer.from(JSON.stringify(p3)));
    this.history.get('TN-CHN-003').push({
      transactionId: `TX-TRANSFER-REJ-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      timestamp: '2026-09-14T12:20:00Z',
      isDelete: false,
      value: p3
    });
  }

  _createContext(txId) {
    const self = this;
    const now = new Date();
    const seconds = Math.floor(now.getTime() / 1000);

    return {
      stub: {
        getTxId: () => txId,
        getTxTimestamp: () => ({ seconds: { low: seconds } }),
        getState: async (key) => self.state.get(key) || Buffer.from(''),
        putState: async (key, value) => {
          self.state.set(key, value);
          if (!self.history.has(key)) {
            self.history.set(key, []);
          }
          let parsed;
          try {
            parsed = JSON.parse(value.toString('utf8'));
          } catch (e) {
            parsed = value.toString('utf8');
          }
          self.history.get(key).push({
            transactionId: txId,
            timestamp: now.toISOString(),
            isDelete: false,
            value: parsed
          });
        },
        getStateByRange: async () => {
          const entries = Array.from(self.state.entries());
          let index = 0;
          return {
            next: async () => {
              if (index < entries.length) {
                const [k, v] = entries[index++];
                return { done: false, value: { key: k, value: v } };
              }
              return { done: true };
            },
            close: async () => {}
          };
        },
        getHistoryForKey: async (key) => {
          const records = self.history.get(key) || [];
          let index = 0;
          return {
            next: async () => {
              if (index < records.length) {
                const rec = records[index++];
                return {
                  done: false,
                  value: {
                    txId: rec.transactionId,
                    timestamp: { seconds: { low: Math.floor(new Date(rec.timestamp).getTime() / 1000) } },
                    isDelete: rec.isDelete,
                    value: Buffer.from(JSON.stringify(rec.value))
                  }
                };
              }
              return { done: true };
            },
            close: async () => {}
          };
        }
      }
    };
  }

  generateTxId(prefix = 'TX') {
    return `${prefix}-${crypto.randomBytes(16).toString('hex')}`;
  }

  async createProperty(parcelId, surveyNumber, ownerId, ownerName, propertyType, documentHash, requestedByRole, officerId) {
    const txId = this.generateTxId('TX-CREATE');
    const ctx = this._createContext(txId);
    const resultStr = await this.contract.CreateProperty(
      ctx,
      parcelId,
      surveyNumber,
      ownerId,
      ownerName,
      propertyType,
      documentHash,
      requestedByRole,
      officerId
    );
    return {
      transactionId: txId,
      data: JSON.parse(resultStr)
    };
  }

  async getProperty(parcelId) {
    const txId = this.generateTxId('TX-QUERY');
    const ctx = this._createContext(txId);
    const resultStr = await this.contract.GetProperty(ctx, parcelId);
    return JSON.parse(resultStr);
  }

  async getAllProperties() {
    const txId = this.generateTxId('TX-QUERY');
    const ctx = this._createContext(txId);
    const resultStr = await this.contract.GetAllProperties(ctx);
    return JSON.parse(resultStr);
  }

  async requestTitleTransfer(parcelId, currentOwnerId, buyerId, buyerName, requestedByRole) {
    const txId = this.generateTxId('TX-TRANSFER-REQUEST');
    const ctx = this._createContext(txId);
    const resultStr = await this.contract.RequestTitleTransfer(
      ctx,
      parcelId,
      currentOwnerId,
      buyerId,
      buyerName,
      requestedByRole
    );
    const prop = JSON.parse(resultStr);
    return {
      transactionId: txId,
      data: {
        parcelId: prop.parcelId,
        titleStatus: prop.titleStatus,
        transferStatus: prop.transferStatus,
        pendingBuyerId: prop.pendingBuyerId,
        pendingBuyerName: prop.pendingBuyerName
      }
    };
  }

  async approveTitleTransfer(parcelId, requestedByRole, officerId) {
    const txId = this.generateTxId('TX-TRANSFER-APPROVE');
    const ctx = this._createContext(txId);
    const resultStr = await this.contract.ApproveTitleTransfer(ctx, parcelId, requestedByRole, officerId);
    const prop = JSON.parse(resultStr);
    return {
      transactionId: txId,
      data: {
        parcelId: prop.parcelId,
        ownerId: prop.ownerId,
        ownerName: prop.ownerName,
        titleStatus: prop.titleStatus,
        transferStatus: prop.transferStatus,
        pendingBuyerId: prop.pendingBuyerId,
        pendingBuyerName: prop.pendingBuyerName
      }
    };
  }

  async rejectTitleTransfer(parcelId, reason, requestedByRole, officerId) {
    const txId = this.generateTxId('TX-TRANSFER-REJECT');
    const ctx = this._createContext(txId);
    const resultStr = await this.contract.RejectTitleTransfer(ctx, parcelId, reason, requestedByRole, officerId);
    const prop = JSON.parse(resultStr);
    return {
      transactionId: txId,
      data: {
        parcelId: prop.parcelId,
        titleStatus: prop.titleStatus,
        transferStatus: prop.transferStatus,
        rejectionReason: prop.rejectionReason
      }
    };
  }

  async getPropertyHistory(parcelId) {
    const txId = this.generateTxId('TX-QUERY');
    const ctx = this._createContext(txId);
    const resultStr = await this.contract.GetPropertyHistory(ctx, parcelId);
    return JSON.parse(resultStr);
  }

  async getDashboardSummary() {
    const all = await this.getAllProperties();
    let activeTitles = 0;
    let pendingTransfers = 0;
    let approvedTransfers = 0;
    let rejectedTransfers = 0;

    for (const p of all) {
      if (p.titleStatus === 'ACTIVE') activeTitles++;
      if (p.transferStatus === 'PENDING') pendingTransfers++;
      if (p.transferStatus === 'APPROVED') approvedTransfers++;
      if (p.transferStatus === 'REJECTED') rejectedTransfers++;
    }

    return {
      totalProperties: all.length,
      activeTitles,
      pendingTransfers,
      approvedTransfers,
      rejectedTransfers
    };
  }
}

const ledgerStoreInstance = new LedgerStore();
module.exports = ledgerStoreInstance;
