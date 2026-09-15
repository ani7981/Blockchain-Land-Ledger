# Digital Land Registry & Title Verification System
### A Privacy-Preserving Consortium Blockchain Framework

[![Hyperledger Fabric](https://img.shields.io/badge/Hyperledger_Fabric-v2.5-2F3134?logo=hyperledger&logoColor=white)](https://www.hyperledger.org/)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-REST_API-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

An enterprise-grade consortium blockchain solution for digital land title registration, ownership transfer governance, and immutable title audit history verification built with **Hyperledger Fabric**.

---

## Quick Navigation

- [System Architecture](#system-architecture)
- [End-to-End Workflow](#end-to-end-workflow)
- [Repository Structure](#repository-structure)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [REST API Contract](#rest-api-contract)
- [Setup & Execution Guide](#setup--execution-guide)
- [Automated Testing](#automated-testing)
- [Interactive Demonstration](#interactive-demonstration)
- [Documentation & Evidence Assets](#documentation--evidence-assets)

---

## System Architecture

The solution uses a **three-tier consortium architecture** that completely isolates client web browsers from blockchain certificates and cryptographic private keys:

```text
+-----------------------------------------------------------------------------------+
|                                  USER INTERFACE                                   |
|               React 18 + Vite Web Application (http://localhost:5173)              |
|  - Dashboard (Metrics & Catalog)           - Register Property (RBAC Protected)   |
|  - Property Search & History Timeline      - Title Transfer Review Portal         |
+----------------------------------------+------------------------------------------+
                                         | REST API (HTTP / JSON)
                                         v
+-----------------------------------------------------------------------------------+
|                                BACKEND API GATEWAY                                |
|                        Node.js + Express (http://localhost:3000)                  |
|  - Request Validation & Error Handling     - Role-Based Access Control (RBAC)     |
|  - Fabric Gateway Client Service           - Deterministic State LedgerStore      |
+----------------------------------------+------------------------------------------+
                                         | gRPC Protocol / Mutual TLS (mTLS)
                                         v
+-----------------------------------------------------------------------------------+
|                        HYPERLEDGER FABRIC CONSORTIUM                              |
|                          (Channel: landchannel)                                   |
|  +----------------------------+             +----------------------------------+  |
|  |   Org1: Registration Dept  |             |     Org2: Survey & Cadastre      |  |
|  |   - peer0.org1.example.com |             |     - peer0.org2.example.com     |  |
|  +----------------------------+             +----------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |           Raft Ordering Service Cluster (orderer.example.com:7050)          |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |           Smart Contract Chaincode: landregistry (Node.js)                  |  |
|  |   - CreateProperty         - RequestTitleTransfer   - GetPropertyHistory    |  |
|  |   - GetProperty            - ApproveTitleTransfer   - World State DB        |  |
|  |   - GetAllProperties       - RejectTitleTransfer    - Transaction Log       |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### Key Privacy & Consortium Principles

1. **Privacy-Preserving Off-Chain Storage:** Full deed PDFs, survey blueprints, and personal identity documents are maintained securely off-chain. Only a deterministic SHA-256 cryptographic hash (`documentHash`) is committed on-chain. Anyone can verify deed authenticity by comparing its hash against the blockchain without exposing sensitive documents on the public ledger.
2. **Multi-Node Consortium Consensus:** Transactions require endorsement from both the Registration Department (`Org1MSP`) and Survey Department (`Org2MSP`) before the Raft orderer batches them into immutable blocks.
3. **Strict RBAC:** Role validation is enforced directly inside smart contract chaincode execution. Unauthorized calls return `403 ACCESS_DENIED` regardless of the client application.

---

## End-to-End Workflow

```text
Registration Officer logs in (OFFICER-001)
        ↓
Submits cadastral data & deed hash on Register Property page
        ↓
Property title is stored through Hyperledger Fabric chaincode
        ↓
Transaction confirmed on blockchain (Transaction ID generated)
        ↓
Public citizen/buyer searches Parcel ID
        ↓
System displays current verified title data and document hash
        ↓
Current Land Owner initiates Title Transfer request
        ↓
Transfer status transitions to PENDING
        ↓
Registration Officer reviews transfer application (Approve / Reject)
        ↓
On approval: Ownership transfers to buyer; status is APPROVED
        ↓
Full chronological audit trail permanently visible in Property History Timeline
```

---

## Repository Structure

```text
Blockchain-Land-Ledger/
├── blockchain/
│   ├── chaincode/
│   │   └── landregistry/
│   │       ├── landRegistryContract.js   # Smart contract implementing all 7 functions
│   │       ├── index.js                  # Chaincode module exports
│   │       ├── package.json              # Chaincode dependencies
│   │       └── test.js                   # Unit tests for contract business logic
│   ├── scripts/
│   │   ├── start-network.sh              # Provisions landchannel and deploys chaincode
│   │   ├── stop-network.sh               # Tears down containers and volumes
│   │   ├── query-ledger.sh               # CLI script to query chaincode on peer
│   │   └── invoke-tx.sh                  # CLI script to invoke chaincode transaction
│   └── README.md
├── backend/
│   ├── src/
│   │   ├── server.js                     # Express REST API server entry point
│   │   ├── routes/
│   │   │   ├── propertyRoutes.js         # Property CRUD and transfer endpoints
│   │   │   └── dashboardRoutes.js        # Dashboard summary statistics endpoint
│   │   ├── services/
│   │   │   ├── fabricService.js          # Fabric Gateway integration layer
│   │   │   └── ledgerStore.js            # Ledger state and history management
│   │   └── middleware/
│   │       └── errorHandler.js           # Standardized error responses & HTTP codes
│   ├── test/
│   │   └── api.test.js                   # Automated REST API test suite (13 test cases)
│   ├── .env.example                      # Environment variables template
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx             # Key metrics and registered asset catalog
│   │   │   ├── RegisterProperty.jsx      # Title registration with input validation
│   │   │   ├── PropertySearch.jsx        # Cadastral query, transfer request & history
│   │   │   └── TransferReview.jsx        # Officer transfer approval & rejection portal
│   │   ├── components/
│   │   │   ├── Navbar.jsx                # Navigation bar with live Role Switcher
│   │   │   └── StatusBadge.jsx           # Title and transfer status indicators
│   │   ├── services/
│   │   │   └── api.js                    # Isolated client API service
│   │   ├── App.jsx                       # Main application shell
│   │   ├── main.jsx                      # React DOM mounting
│   │   └── index.css                     # Modern enterprise styling
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── README.md
├── docs/
│   ├── Digital_Land_Registry_Documentation.md  # Comprehensive project report for Word/PDF
│   ├── presentation_slides.md            # 10-slide presentation deck guide
│   ├── demo-script.md                    # 3-5 minute live demonstration script
│   ├── api-contract.md                   # REST endpoint specifications & schemas
│   ├── chaincode-spec.md                 # Smart contract function specifications
│   ├── data-model.md                     # Asset model and naming standards
│   ├── integration-checklist.md          # End-to-end verification checklist
│   ├── testing-plan.md                   # Test cases TC-01 to TC-15 & evidence map
│   └── PROJECT_START_HERE.md             # Project starter pack and boundary rules
├── screenshots/                          # 13 high-resolution verification screenshots
├── README.md
└── .gitignore
```

---

## Role-Based Access Control (RBAC)

| System Action | Authorized Role | Smart Contract Check | Unauthorized Behavior |
|---|---|---|---|
| **Create Property** | `REGISTRATION_OFFICER` | `requestedByRole === 'REGISTRATION_OFFICER'` | Returns `403 ACCESS_DENIED` |
| **Search / Query Property** | Any (Public) | None (Publicly auditable) | Permitted |
| **Request Title Transfer** | `LAND_OWNER` | Caller must match current `ownerId` | Returns `403 ACCESS_DENIED` |
| **Approve Title Transfer** | `REGISTRATION_OFFICER` | `requestedByRole === 'REGISTRATION_OFFICER'` | Returns `403 ACCESS_DENIED` |
| **Reject Title Transfer** | `REGISTRATION_OFFICER` | `requestedByRole === 'REGISTRATION_OFFICER'` | Returns `403 ACCESS_DENIED` |
| **View Audit History** | Any (Public) | None (Transparent audit trail) | Permitted |

---

## REST API Contract

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/health` | Health check & consortium status | Any |
| `POST` | `/properties` | Register a new property on blockchain | `REGISTRATION_OFFICER` |
| `GET` | `/properties` | List all registered properties | Any |
| `GET` | `/properties/:parcelId` | Query property by parcel ID | Any |
| `POST` | `/properties/:parcelId/transfer` | Submit title transfer request | `LAND_OWNER` |
| `POST` | `/properties/:parcelId/approve` | Approve pending title transfer | `REGISTRATION_OFFICER` |
| `POST` | `/properties/:parcelId/reject` | Reject pending title transfer | `REGISTRATION_OFFICER` |
| `GET` | `/properties/:parcelId/history` | Retrieve full chronological state history | Any |
| `GET` | `/dashboard/summary` | Retrieve high-level consortium statistics | Any |

---

## Setup & Execution Guide

### Prerequisites
- Node.js (v18 or newer) and npm
- Docker and Docker Compose
- Linux / macOS / WSL2 environment

### 1. Start Hyperledger Fabric Network
```bash
cd blockchain/fabric-samples/test-network
./network.sh up createChannel -c landchannel
```

### 2. Start Backend REST API
```bash
cd backend
npm install
npm start
```
*Backend runs at `http://localhost:3000` (Health check: `http://localhost:3000/api/health`)*

### 3. Start Frontend Web Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend opens at `http://localhost:5173`*

---

## Automated Testing

### Smart Contract Logic Verification (10 Tests)
```bash
node blockchain/chaincode/landregistry/test.js
```
Validates parcel creation, duplicate rejection, role verification, transfer workflow, rejection reasons, and history retrieval.

### REST API Integration Test Suite (13 Tests)
```bash
cd backend
npm test
```
Executes automated HTTP tests against all endpoints covering creation, input validation, role enforcement, transfer requests, approvals, rejections, and history timeline retrieval.

---

## Interactive Demonstration

To replicate the viva demonstration flow in your browser:

1. Open **`http://localhost:5173`**.
2. **Create Property:** Ensure role is **Registration Officer** &rarr; open **Register Property** &rarr; click **Fill TN-CHN-001 (Demo)** &rarr; click **Register on Blockchain** (observe transaction ID and active title status).
3. **Verify Title:** Go to **Property Search & History** &rarr; query **`TN-CHN-001`** &rarr; inspect cadastral details and deed hash.
4. **Submit Transfer:** Switch role to **Land Owner** &rarr; scroll to **Submit Title Transfer Request** &rarr; enter buyer `BUYER-001` (`Priya Menon`) &rarr; submit request (status transitions to `PENDING`).
5. **Approve Transfer:** Switch role back to **Registration Officer** &rarr; go to **Transfer Review** &rarr; click **Approve** (ownership transfers to Priya Menon).
6. **Audit History:** Return to **Property Search & History** &rarr; inspect the **Immutable Property History Timeline** displaying all 3 chronological revisions.
7. **Security Check:** Switch role to **Land Owner** &rarr; attempt to register a property &rarr; verify `403 ACCESS_DENIED` enforcement.

---

## Documentation & Evidence Assets

All project submission materials are located in the repository:

- **Comprehensive Report (Word/PDF ready):** [`docs/Digital_Land_Registry_Documentation.md`](docs/Digital_Land_Registry_Documentation.md) (Architecture, Implementation, Full Testing Table TC-01 to TC-15, Division of Work, Viva Q&A).
- **Presentation Slide Deck Guide:** [`docs/presentation_slides.md`](docs/presentation_slides.md) (10-slide outline with diagrams and speaker talking points).
- **Live Demo Script:** [`docs/demo-script.md`](docs/demo-script.md) (Timed 3–5 minute rehearsal script).
- **Screenshots Directory:** [`screenshots/`](screenshots/)
  - `01_docker_containers_running.png` — Running peer and orderer containers
  - `02_fabric_network_started.png` — Network startup and CA generation
  - `03_landchannel_created.png` — Channel creation and peer join confirmation
  - `04_chaincode_deployed.png` — Chaincode approval and commit logs
  - `05_register_property_form.png` — Cadastral registration form
  - `06_property_registration_success.png` — Registration confirmation & Tx ID
  - `07_property_search_result.png` — Title lookup & active status
  - `08_transfer_request_pending.png` — Transfer request submitted (pending review)
  - `09_transfer_approved.png` — Officer review & approval confirmation
  - `10_property_history.png` — Chronological revision timeline
  - `11_access_control_error.png` — 403 access control rejection proof
  - `12_api_response_success.png` — REST API query response
  - `13_github_repository_structure.png` — Clean repository structure tree
