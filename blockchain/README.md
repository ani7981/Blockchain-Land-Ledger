# Blockchain Module — Digital Land Registry

This directory contains the Hyperledger Fabric smart contract (chaincode), network scripts, and sample network configuration for the consortium blockchain.

## Configuration Standards

- **Channel Name:** `landchannel`
- **Chaincode Name:** `landregistry`
- **Chaincode Language:** JavaScript / Node.js
- **Endorsement Policy:** Consortium default (Org1 & Org2 endorsement)

## Chaincode Business Logic

Located in `chaincode/landregistry/landRegistryContract.js`:

1. `CreateProperty(ctx, parcelId, surveyNumber, ownerId, ownerName, propertyType, documentHash, requestedByRole, officerId)`:
   - Validates caller role is `REGISTRATION_OFFICER`.
   - Checks parcel does not exist.
   - Sets `titleStatus = ACTIVE`, `transferStatus = NONE`.
2. `GetProperty(ctx, parcelId)`:
   - Fetches current property asset by unique parcel ID.
3. `GetAllProperties(ctx)`:
   - Queries all assets with `docType = property`.
4. `RequestTitleTransfer(ctx, parcelId, currentOwnerId, buyerId, buyerName, requestedByRole)`:
   - Validates caller role is `LAND_OWNER` and matches current owner.
   - Sets `transferStatus = PENDING`, records buyer details.
5. `ApproveTitleTransfer(ctx, parcelId, requestedByRole, officerId)`:
   - Validates caller role is `REGISTRATION_OFFICER`.
   - Updates `ownerId` and `ownerName` to buyer.
   - Sets `transferStatus = APPROVED`.
6. `RejectTitleTransfer(ctx, parcelId, reason, requestedByRole, officerId)`:
   - Validates caller role is `REGISTRATION_OFFICER`.
   - Sets `transferStatus = REJECTED`, records `rejectionReason`.
7. `GetPropertyHistory(ctx, parcelId)`:
   - Invokes `ctx.stub.getHistoryForKey(parcelId)` to retrieve full audit history.

## Network Lifecycle Scripts

Located in `scripts/`:

- `./scripts/start-network.sh`: Starts Fabric network, provisions `landchannel`, and deploys `landregistry`.
- `./scripts/stop-network.sh`: Shuts down containers and cleans test volumes.
- `./scripts/query-ledger.sh [parcelId]`: Queries property state directly from peer CLI.
- `./scripts/invoke-tx.sh`: Submits a peer CLI transaction.

## Verification Tests

Run the contract verification suite:

```bash
node chaincode/landregistry/test.js
```
