# Backend API Service — Digital Land Registry

REST API gateway connecting the web frontend to the Hyperledger Fabric consortium blockchain.

## Technology Stack

- Node.js & Express
- Hyperledger Fabric Gateway integration & embedded deterministic LedgerStore
- CORS, dotenv, and REST JSON standard

## Port and Base URL

- **URL:** `http://localhost:3000`
- **Prefix:** `/api`

## REST Endpoints

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health status | Any |
| `POST` | `/api/properties` | Register a new property on blockchain | `REGISTRATION_OFFICER` |
| `GET` | `/api/properties` | Retrieve all registered properties | Any |
| `GET` | `/api/properties/:parcelId` | Query property by parcel ID | Any |
| `POST` | `/api/properties/:parcelId/transfer` | Request a title transfer | `LAND_OWNER` |
| `POST` | `/api/properties/:parcelId/approve` | Approve a title transfer | `REGISTRATION_OFFICER` |
| `POST` | `/api/properties/:parcelId/reject` | Reject a title transfer | `REGISTRATION_OFFICER` |
| `GET` | `/api/properties/:parcelId/history` | Retrieve full immutable state history | Any |
| `GET` | `/api/dashboard/summary` | Get high-level counts and statistics | Any |

## Running the Backend

```bash
cd backend
npm install
npm run dev
```

## Running Automated Endpoint Tests

```bash
cd backend
npm test
```
