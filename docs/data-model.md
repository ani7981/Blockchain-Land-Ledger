# Data Model and Naming Standard

This document prevents frontend, backend, and chaincode field mismatches.

## Main asset: Property

| Field | Type | Required | Example | Notes |
|---|---|---:|---|---|
| `docType` | string | Yes | `property` | Set by chaincode |
| `parcelId` | string | Yes | `TN-CHN-001` | Unique blockchain key |
| `surveyNumber` | string | Yes | `114/2A` | Survey/cadastral reference |
| `ownerId` | string | Yes | `OWNER-001` | Current owner identifier |
| `ownerName` | string | Yes | `Ravi Kumar` | Demo name only; real systems should protect sensitive personal data |
| `propertyType` | string | Yes | `Residential` | Residential, Commercial, Agricultural, Institutional |
| `documentHash` | string | Yes | `4b2e7c9a11d3` | Simulated SHA-256-style document hash for MVP |
| `titleStatus` | string | Yes | `ACTIVE` | `ACTIVE` or `DISPUTED` |
| `transferStatus` | string | Yes | `NONE` | `NONE`, `PENDING`, `APPROVED`, `REJECTED` |
| `pendingBuyerId` | string | Yes | `BUYER-001` | Empty when no transfer is pending |
| `pendingBuyerName` | string | Yes | `Priya Menon` | Empty when no transfer is pending |
| `rejectionReason` | string | Yes | `Document verification incomplete` | Empty unless transfer is rejected |
| `createdAt` | ISO timestamp | Yes | `2026-09-14T12:00:00Z` | Set by chaincode/backend |
| `updatedAt` | ISO timestamp | Yes | `2026-09-14T12:10:00Z` | Updated on every write |
| `createdBy` | string | Yes | `OFFICER-001` | Initial creator identifier |

## Internal status constants

```javascript
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

const ROLES = {
  REGISTRATION_OFFICER: 'REGISTRATION_OFFICER',
  SURVEY_OFFICER: 'SURVEY_OFFICER',
  LAND_OWNER: 'LAND_OWNER',
  BUYER: 'BUYER',
  ADMIN: 'ADMIN'
};
```

## Sample properties

### Sample 1: Active property

```json
{
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
  "rejectionReason": ""
}
```

### Sample 2: Pending transfer

```json
{
  "parcelId": "TN-CHN-002",
  "surveyNumber": "216/4B",
  "ownerId": "OWNER-002",
  "ownerName": "Meera Iyer",
  "propertyType": "Commercial",
  "documentHash": "f9354be02d6c",
  "titleStatus": "ACTIVE",
  "transferStatus": "PENDING",
  "pendingBuyerId": "BUYER-002",
  "pendingBuyerName": "Arjun Das",
  "rejectionReason": ""
}
```

### Sample 3: Rejected transfer

```json
{
  "parcelId": "TN-CHN-003",
  "surveyNumber": "88/1",
  "ownerId": "OWNER-003",
  "ownerName": "Suresh Babu",
  "propertyType": "Agricultural",
  "documentHash": "c9b62cf744f1",
  "titleStatus": "ACTIVE",
  "transferStatus": "REJECTED",
  "pendingBuyerId": "BUYER-003",
  "pendingBuyerName": "Ananya Roy",
  "rejectionReason": "Survey verification is incomplete"
}
```

## Privacy rule for the prototype

For the one-day MVP, demonstrate that the ledger stores a `documentHash`, not the original deed or identity document.

Use this explanation in your PPT and documentation:

> Original documents are not stored directly on-chain. The system stores their cryptographic hash, allowing later integrity verification without unnecessarily placing large or sensitive files on the blockchain. IPFS-based off-chain storage is documented as a future enhancement.
