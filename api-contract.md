# API Contract

This file is the agreement between the blockchain/backend developer and the frontend developer.

**Do not rename fields, endpoints, functions, or status values without informing the other member.**

## Base URL

```text
http://localhost:3000
```

All endpoints start with:

```text
/api
```

## Standard response shape

### Success response

```json
{
  "success": true,
  "message": "Human-readable success message",
  "transactionId": "Fabric transaction ID or mock transaction ID",
  "data": {}
}
```

### Error response

```json
{
  "success": false,
  "message": "Human-readable failure message",
  "errorCode": "VALIDATION_ERROR | ACCESS_DENIED | NOT_FOUND | CONFLICT | BLOCKCHAIN_ERROR"
}
```

## 1. Create property

```text
POST /api/properties
```

**Chaincode function:** `CreateProperty`

**Role required:** `REGISTRATION_OFFICER`

### Request

```json
{
  "parcelId": "TN-CHN-001",
  "surveyNumber": "114/2A",
  "ownerId": "OWNER-001",
  "ownerName": "Ravi Kumar",
  "propertyType": "Residential",
  "documentHash": "4b2e7c9a11d3",
  "requestedByRole": "REGISTRATION_OFFICER"
}
```

### Successful response

```json
{
  "success": true,
  "message": "Property registered successfully on blockchain",
  "transactionId": "TX-CREATE-001",
  "data": {
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
    "updatedAt": "2026-09-14T12:00:00Z"
  }
}
```

## 2. Get all properties

```text
GET /api/properties
```

**Chaincode function:** `GetAllProperties`

### Successful response

```json
{
  "success": true,
  "message": "Properties retrieved successfully",
  "data": [
    {
      "parcelId": "TN-CHN-001",
      "ownerName": "Ravi Kumar",
      "titleStatus": "ACTIVE",
      "transferStatus": "NONE"
    }
  ]
}
```

## 3. Get property by parcel ID

```text
GET /api/properties/:parcelId
```

**Chaincode function:** `GetProperty`

### Successful response

```json
{
  "success": true,
  "message": "Property retrieved successfully",
  "data": {
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
    "updatedAt": "2026-09-14T12:00:00Z"
  }
}
```

## 4. Request title transfer

```text
POST /api/properties/:parcelId/transfer
```

**Chaincode function:** `RequestTitleTransfer`

**Role required:** `LAND_OWNER`

### Request

```json
{
  "currentOwnerId": "OWNER-001",
  "buyerId": "BUYER-001",
  "buyerName": "Priya Menon",
  "requestedByRole": "LAND_OWNER"
}
```

### Successful response

```json
{
  "success": true,
  "message": "Title transfer request submitted successfully",
  "transactionId": "TX-TRANSFER-REQUEST-001",
  "data": {
    "parcelId": "TN-CHN-001",
    "titleStatus": "ACTIVE",
    "transferStatus": "PENDING",
    "pendingBuyerId": "BUYER-001",
    "pendingBuyerName": "Priya Menon"
  }
}
```

## 5. Approve title transfer

```text
POST /api/properties/:parcelId/approve
```

**Chaincode function:** `ApproveTitleTransfer`

**Role required:** `REGISTRATION_OFFICER`

### Request

```json
{
  "officerId": "OFFICER-001",
  "requestedByRole": "REGISTRATION_OFFICER"
}
```

### Successful response

```json
{
  "success": true,
  "message": "Title transfer approved successfully",
  "transactionId": "TX-TRANSFER-APPROVE-001",
  "data": {
    "parcelId": "TN-CHN-001",
    "ownerId": "BUYER-001",
    "ownerName": "Priya Menon",
    "titleStatus": "ACTIVE",
    "transferStatus": "APPROVED",
    "pendingBuyerId": "",
    "pendingBuyerName": ""
  }
}
```

## 6. Reject title transfer

```text
POST /api/properties/:parcelId/reject
```

**Chaincode function:** `RejectTitleTransfer`

**Role required:** `REGISTRATION_OFFICER`

### Request

```json
{
  "officerId": "OFFICER-001",
  "reason": "Required sale-deed verification is incomplete",
  "requestedByRole": "REGISTRATION_OFFICER"
}
```

### Successful response

```json
{
  "success": true,
  "message": "Title transfer rejected successfully",
  "transactionId": "TX-TRANSFER-REJECT-001",
  "data": {
    "parcelId": "TN-CHN-001",
    "titleStatus": "ACTIVE",
    "transferStatus": "REJECTED",
    "rejectionReason": "Required sale-deed verification is incomplete"
  }
}
```

## 7. Get property history

```text
GET /api/properties/:parcelId/history
```

**Chaincode function:** `GetPropertyHistory`

### Successful response

```json
{
  "success": true,
  "message": "Property history retrieved successfully",
  "data": [
    {
      "transactionId": "TX-CREATE-001",
      "timestamp": "2026-09-14T12:00:00Z",
      "isDelete": false,
      "value": {
        "parcelId": "TN-CHN-001",
        "ownerName": "Ravi Kumar",
        "transferStatus": "NONE"
      }
    },
    {
      "transactionId": "TX-TRANSFER-REQUEST-001",
      "timestamp": "2026-09-14T12:10:00Z",
      "isDelete": false,
      "value": {
        "parcelId": "TN-CHN-001",
        "ownerName": "Ravi Kumar",
        "transferStatus": "PENDING",
        "pendingBuyerName": "Priya Menon"
      }
    }
  ]
}
```

## 8. Dashboard summary

```text
GET /api/dashboard/summary
```

### Successful response

```json
{
  "success": true,
  "message": "Dashboard summary retrieved successfully",
  "data": {
    "totalProperties": 4,
    "activeTitles": 3,
    "pendingTransfers": 1,
    "approvedTransfers": 2,
    "rejectedTransfers": 0
  }
}
```

## Frontend display mapping

| Backend value | Display text | Suggested color |
|---|---|---|
| `ACTIVE` | Active Title | Green |
| `DISPUTED` | Disputed Title | Red |
| `NONE` | No Pending Transfer | Gray |
| `PENDING` | Pending Officer Review | Amber |
| `APPROVED` | Transfer Approved | Green |
| `REJECTED` | Transfer Rejected | Red |

## Integration rule

The frontend must call only the backend API. It must never use Fabric certificates, private keys, connection profiles, or peer endpoints directly.