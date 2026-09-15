# A Privacy-Preserving Consortium Blockchain Framework for Digital Land Registry and Title Verification

A full-stack, enterprise-grade consortium blockchain solution for digital land title registry, ownership transfer, and audit history verification powered by Hyperledger Fabric.

## System Workflow

```text
Registration Officer logs in
        ↓
Creates a property record
        ↓
Property is stored through Hyperledger Fabric chaincode
        ↓
Transaction is confirmed (Transaction ID returned)
        ↓
User searches parcel ID
        ↓
System displays current title data and transaction history
        ↓
Owner submits title-transfer request
        ↓
Registration Officer approves/rejects it
        ↓
Updated ownership record is visible on the ledger
```

## Repository Structure

```text
digital-land-registry/
├── blockchain/
│   ├── chaincode/
│   │   └── landregistry/       # Hyperledger Fabric chaincode smart contract
│   ├── scripts/                # Network startup, teardown, and query scripts
│   ├── fabric-samples/         # Fabric test-network, binaries, and configurations
│   └── README.md
├── backend/
│   ├── src/
│   │   ├── server.js           # Express REST API server
│   │   ├── routes/             # Property & Dashboard route handlers
│   │   ├── services/           # Fabric Gateway & LedgerStore service
│   │   └── middleware/         # Role checks and error handling
│   ├── test/                   # Automated API integration tests (13 test cases)
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── pages/              # Dashboard, Register, Search & History, Transfer Review
│   │   ├── components/         # Navbar, StatusBadge
│   │   ├── services/           # API integration client
│   │   └── App.jsx
│   ├── package.json
│   └── README.md
├── docs/                       # Specifications, API contract, testing plans, demo scripts
├── screenshots/                # Verification evidence and terminal logs
└── README.md
```

## Non-Negotiable Naming

- **Channel:** `landchannel`
- **Chaincode:** `landregistry`
- **Asset Key:** `parcelId`
- **Title Status:** `ACTIVE`, `DISPUTED`
- **Transfer Status:** `NONE`, `PENDING`, `APPROVED`, `REJECTED`

## Quick Start Guide

### 1. Run Chaincode Logic Verification Tests

```bash
node blockchain/chaincode/landregistry/test.js
```

### 2. Start Backend API

```bash
cd backend
npm install
npm test      # Runs all 13 automated REST integration tests
npm start     # Starts backend on http://localhost:3000
```

### 3. Start Frontend Application

```bash
cd frontend
npm install
npm run dev   # Starts Vite development server on http://localhost:5173
```
