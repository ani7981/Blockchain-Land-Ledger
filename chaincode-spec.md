# Land Registry Chaincode Specification

**Channel:** `landchannel`  
**Chaincode name:** `landregistry`  
**Suggested language:** JavaScript / Node.js  
**Asset type:** `Property`

## MVP design rule

Implement only the functions in this document before attempting additional privacy features, IPFS, title tokens, or further organizations.

## Property asset schema

```json
{
  "docType": "property",
  "parcelId": "TN-CHN-001",
  "surveyNumber": "114/2A",
  "ownerId": "OWNER-001",
  "ownerName": "Ravi Kumar",
  "propertyType": "Residential",
  "documentHash": "4b2e7c9a11d3",
  "titleStatus": "ACTIVE",
  "transferStatus": "NONE",
  "pendingBuyerId": "",
  "pendingBuyerName": "",
  "rejectionReason": "",
  "createdAt": "2026-09-14T12:00:00Z",
  "updatedAt": "2026-09-14T12:00:00Z",
  "createdBy": "OFFICER-001"
}
```

## Roles

```text
REGISTRATION_OFFICER
SURVEY_OFFICER
LAND_OWNER
BUYER
ADMIN
```

For the one-day prototype, roles may be passed through the backend for demonstration. The chaincode must at least validate `REGISTRATION_OFFICER` for create/approve/reject actions.

## Transaction functions

### 1. CreateProperty

```text
CreateProperty(ctx, parcelId, surveyNumber, ownerId, ownerName, propertyType, documentHash, requestedByRole, officerId)
```

Rules:
- `requestedByRole` must be `REGISTRATION_OFFICER`.
- `parcelId` must not already exist.
- All required values must be non-empty.
- Initial `titleStatus` is `ACTIVE`.
- Initial `transferStatus` is `NONE`.

### 2. GetProperty

```text
GetProperty(ctx, parcelId)
```

Rules:
- Property must exist.
- Return the current JSON asset.

### 3. GetAllProperties

```text
GetAllProperties(ctx)
```

Rules:
- Return all property assets.
- For MVP, iterate through key range or use a simple query.

### 4. RequestTitleTransfer

```text
RequestTitleTransfer(ctx, parcelId, currentOwnerId, buyerId, buyerName, requestedByRole)
```

Rules:
- `requestedByRole` must be `LAND_OWNER`.
- Property must exist.
- `currentOwnerId` must match the current `ownerId`.
- Property must not already have a `PENDING` transfer.
- Property title must not be `DISPUTED`.
- Set `transferStatus` to `PENDING`.
- Set `pendingBuyerId` and `pendingBuyerName`.

### 5. ApproveTitleTransfer

```text
ApproveTitleTransfer(ctx, parcelId, requestedByRole, officerId)
```

Rules:
- `requestedByRole` must be `REGISTRATION_OFFICER`.
- Property must exist.
- `transferStatus` must be `PENDING`.
- Replace current owner with pending buyer.
- Set `transferStatus` to `APPROVED`.
- Clear `pendingBuyerId` and `pendingBuyerName`.
- Update timestamp.

### 6. RejectTitleTransfer

```text
RejectTitleTransfer(ctx, parcelId, reason, requestedByRole, officerId)
```

Rules:
- `requestedByRole` must be `REGISTRATION_OFFICER`.
- Property must exist.
- `transferStatus` must be `PENDING`.
- Set `transferStatus` to `REJECTED`.
- Store `rejectionReason`.
- Do not modify the current owner.

### 7. GetPropertyHistory

```text
GetPropertyHistory(ctx, parcelId)
```

Rules:
- Use `ctx.stub.getHistoryForKey(parcelId)`.
- Return transaction ID, timestamp, delete status, and property value for every historical update.

## Required error messages

Use clear messages. They will be displayed in the frontend and screenshots.

```text
Property with parcel ID <id> already exists
Property with parcel ID <id> does not exist
Only a Registration Officer can create a property
Only a Land Owner can submit a title transfer request
Only a Registration Officer can approve a title transfer
Only a Registration Officer can reject a title transfer
Only the current owner can request the transfer
A title transfer request is already pending
No pending title transfer exists
Cannot transfer a disputed property
```

## Sample demo data

### Property creation

```text
parcelId: TN-CHN-001
surveyNumber: 114/2A
ownerId: OWNER-001
ownerName: Ravi Kumar
propertyType: Residential
documentHash: 4b2e7c9a11d3
requestedByRole: REGISTRATION_OFFICER
officerId: OFFICER-001
```

### Transfer request

```text
parcelId: TN-CHN-001
currentOwnerId: OWNER-001
buyerId: BUYER-001
buyerName: Priya Menon
requestedByRole: LAND_OWNER
```

### Approval

```text
parcelId: TN-CHN-001
requestedByRole: REGISTRATION_OFFICER
officerId: OFFICER-001
```

## Expected transaction lifecycle

```text
CreateProperty
  -> ACTIVE / NONE

RequestTitleTransfer
  -> ACTIVE / PENDING

ApproveTitleTransfer
  -> ACTIVE / APPROVED
  -> owner changes to the pending buyer

GetPropertyHistory
  -> returns all state versions in chronological order
```

## Chaincode acceptance tests

- Create a property successfully as `REGISTRATION_OFFICER`.
- Reject duplicate property creation.
- Reject property creation as `LAND_OWNER`.
- Retrieve a property by `parcelId`.
- Request a valid transfer as current `LAND_OWNER`.
- Reject transfer request by an incorrect owner.
- Approve transfer as `REGISTRATION_OFFICER`.
- Reject approval attempt by `LAND_OWNER`.
- Retrieve complete property history.
