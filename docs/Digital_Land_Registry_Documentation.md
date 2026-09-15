# Digital Land Registry and Title Verification System
## Project Documentation & Viva Examination Report

**Project Title:** A Privacy-Preserving Consortium Blockchain Framework for Digital Land Registry and Title Verification  
**Architecture:** Permissioned Consortium Blockchain (Hyperledger Fabric)  
**Channel:** `landchannel`  
**Smart Contract (Chaincode):** `landregistry`  
**Target Asset:** `Property` (Primary Key: `parcelId`)  
**Scope:** Blockchain only. No AI/ML components.

---

## 1. Executive Summary & Problem Definition

Traditional centralized land registry systems suffer from single points of failure, vulnerability to fraudulent double-selling, retroactive record tampering, bureaucratic delays, and privacy leakage of sensitive documents.

This project implements a permissioned consortium blockchain system built on Hyperledger Fabric to solve these challenges:
1. **Immutability & Integrity:** Land records are cryptographically signed and stored across distributed peer nodes. Previous titles and state revisions cannot be altered or deleted.
2. **Privacy-Preserving Off-Chain Storage:** Large or sensitive land deeds and personal identity documents are maintained off-chain; only deterministic SHA-256 cryptographic hashes (`documentHash`) are stored on-ledger. This guarantees integrity verification without exposing private files on the shared ledger.
3. **Role-Based Access Control (RBAC):** Strict role enforcement at both smart contract and gateway levels prevents unauthorized registration, transfers, or approvals.
4. **End-to-End Workflow:** Supports complete digital lifecycle from initial cadastral registration by a Registration Officer, public title search and verification, transfer initiation by a Land Owner, and formal review (approval/rejection) by the authorities.

---

## 2. Division of Work

| Team Member | Module / Responsibilities | Deliverables Completed |
|---|---|---|
| **Member 1 (Blockchain & Backend Lead)** | - Hyperledger Fabric network configuration & Docker deployment<br>- Creation of consortium channel `landchannel`<br>- Implementation of `landregistry` chaincode contract<br>- Implementation of chaincode functions: `CreateProperty`, `GetProperty`, `GetAllProperties`, `RequestTitleTransfer`, `ApproveTitleTransfer`, `RejectTitleTransfer`, `GetPropertyHistory`<br>- Backend REST API architecture (Express / Node.js)<br>- Fabric Gateway / LedgerStore service layer<br>- Role-based access control validation logic<br>- Automated integration test suite (13 API test cases) | - `blockchain/chaincode/landregistry/`<br>- `blockchain/scripts/`<br>- `backend/src/`<br>- `backend/test/api.test.js`<br>- Channel & chaincode deployment |
| **Member 2 (Frontend, Docs & Testing Lead)** | - React/Vite web application development<br>- Four responsive user interface pages:<br>&nbsp;&nbsp;1. Dashboard (Consortium metrics & ledger table)<br>&nbsp;&nbsp;2. Register Property (with live input validation)<br>&nbsp;&nbsp;3. Property Search & History (Audit timeline)<br>&nbsp;&nbsp;4. Transfer Review (Officer decision portal)<br>- Client-side input validation and error feedback<br>- Integration with backend REST contract<br>- Preparation of testing plan and evidence sheet<br>- Live demonstration script and viva rehearsal guide<br>- Project presentation slide content and documentation | - `frontend/src/`<br>- `docs/api-contract.md`<br>- `docs/testing-plan.md`<br>- `docs/demo-script.md`<br>- `docs/presentation_slides.md`<br>- UI screenshots & evidence logs |

---

## 3. System Architecture

```text
+-----------------------------------------------------------------------------------+
|                                  USER LAYER                                       |
|  +---------------------------+             +----------------------------------+   |
|  |   Registration Officer    |             |       Citizen / Land Owner       |   |
|  +-------------+-------------+             +----------------+-----------------+   |
+----------------|--------------------------------------------|---------------------+
                 |                                            |
                 v                                            v
+-----------------------------------------------------------------------------------+
|                             FRONTEND WEB APPLICATION                              |
|                          (React 18 + Vite + Lucide Icons)                         |
|  - Dashboard: Metrics & Catalog            - Register Property (RBAC Protected)   |
|  - Search & History Timeline               - Transfer Review & Decision Portal    |
+----------------------------------------+------------------------------------------+
                                         | REST API (HTTP JSON)
                                         v
+-----------------------------------------------------------------------------------+
|                               BACKEND API GATEWAY                                 |
|                         (Node.js + Express + Middleware)                          |
|  - /api/properties                         - /api/properties/:parcelId/transfer   |
|  - /api/properties/:parcelId               - /api/properties/:parcelId/approve    |
|  - /api/properties/:parcelId/history       - /api/properties/:parcelId/reject     |
|  - /api/dashboard/summary                  - Role Check & Validation Middleware   |
+----------------------------------------+------------------------------------------+
                                         | Fabric Gateway / gRPC Protocol
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
|  |           Raft Ordering Service (orderer.example.com:7050)                  |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |           Chaincode Smart Contract: landregistry (Node.js)                  |  |
|  |   - CreateProperty         - RequestTitleTransfer   - GetPropertyHistory    |  |
|  |   - GetProperty            - ApproveTitleTransfer   - State Database        |  |
|  |   - GetAllProperties       - RejectTitleTransfer    - Transaction Log       |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 4. Implementation Details

### 4.1 Data Model Standards

All layers (chaincode, backend, frontend) strictly adhere to the following schema:

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

### 4.2 Chaincode Smart Contract Functions

The chaincode (`blockchain/chaincode/landregistry/landRegistryContract.js`) implements 7 core functions:
1. `CreateProperty(...)`: Enforces `requestedByRole === 'REGISTRATION_OFFICER'`, validates uniqueness of `parcelId`, sets `titleStatus = ACTIVE` and `transferStatus = NONE`.
2. `GetProperty(parcelId)`: Retrieves key-value state for given parcel. Throws 404 if not found.
3. `GetAllProperties()`: Performs range iteration across world state to retrieve all registered parcels.
4. `RequestTitleTransfer(...)`: Requires `LAND_OWNER` matching `ownerId`. Checks that parcel is not `DISPUTED` and has no active `PENDING` transfer. Sets status to `PENDING` and records `pendingBuyerId` and `pendingBuyerName`.
5. `ApproveTitleTransfer(...)`: Requires `REGISTRATION_OFFICER`. Mutates ownership from existing owner to pending buyer, updates `transferStatus = APPROVED`, and clears pending buyer fields.
6. `RejectTitleTransfer(...)`: Requires `REGISTRATION_OFFICER`. Preserves current owner, updates `transferStatus = REJECTED`, and stores `rejectionReason`.
7. `GetPropertyHistory(parcelId)`: Calls `ctx.stub.getHistoryForKey(parcelId)` and formats chronological block transaction history.

### 4.3 Form Validation Rules (Frontend & Backend)

The registration and transfer forms enforce strict validation:
- **Parcel ID:** Non-empty, alphanumeric string format (e.g. `TN-CHN-001`).
- **Survey Number:** Non-empty cadastral reference (e.g. `114/2A`).
- **Owner ID & Owner Name:** Required identifier and legal name.
- **Document Hash:** Non-empty cryptographic hash representing the off-chain deed.
- **Client & Server Feedback:** Invalid inputs trigger inline red error hints without sending invalid transactions to the blockchain network.

---

## 5. Testing Plan and Evidence Table

All 15 test cases defined in `docs/testing-plan.md` have been executed and verified:

| Test ID | Module | Test Scenario | Action / Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|:---:|
| **TC-01** | Network | Fabric test network startup | Execute network launch script | Orderer, peers, CA, and tools start | Docker containers running; orderer & peers active | **PASS** |
| **TC-02** | Channel | Create consortium channel | Create channel `landchannel` | Channel genesis block created and peers join | `landchannel` successfully created and joined | **PASS** |
| **TC-03** | Chaincode | Deploy `landregistry` | Package, approve, and commit chaincode | Chaincode committed on `landchannel` | Chaincode definition committed; ready for invocations | **PASS** |
| **TC-04** | Chaincode | Property registration | Officer creates `TN-CHN-001` | Committed with `ACTIVE` status & `NONE` transfer status | State committed with `titleStatus: ACTIVE`; Tx ID generated | **PASS** |
| **TC-05** | Chaincode | Reject duplicate property | Submit identical `TN-CHN-001` | Rejected with duplicate parcel error | Threw error: `Property with parcel ID TN-CHN-001 already exists` | **PASS** |
| **TC-06** | Security | Unauthorized create attempt | Role `LAND_OWNER` calls `CreateProperty` | Access denied with 403 error | Threw error: `Only a Registration Officer can create a property` | **PASS** |
| **TC-07** | Query | Query property state | `GetProperty` on `TN-CHN-001` | Returns current property record | Returned current owner Ravi Kumar and active status | **PASS** |
| **TC-08** | Transfer | Request title transfer | Owner requests transfer to Priya Menon | Status transitions to `PENDING` | `transferStatus = PENDING`, `pendingBuyerId = BUYER-001` | **PASS** |
| **TC-09** | Security | Unauthorized approval attempt | Land owner attempts approval | Rejected with access denied | Threw error: `Only a Registration Officer can approve a title transfer` | **PASS** |
| **TC-10** | Transfer | Approve title transfer | Officer approves `TN-CHN-001` | Owner changes to Priya Menon; status is `APPROVED` | Owner updated to Priya Menon (`BUYER-001`); status `APPROVED` | **PASS** |
| **TC-11** | Transfer | Reject title transfer | Officer rejects pending transfer with reason | Owner remains unchanged; reason stored | Status `REJECTED`, reason stored, original owner retained | **PASS** |
| **TC-12** | Audit | Retrieve property history | `GetPropertyHistory` on `TN-CHN-001` | Chronological revisions returned | All 3 revisions returned with transaction IDs & timestamps | **PASS** |
| **TC-13** | Frontend | Property creation form | Submit valid form in web UI | Success banner & Fabric Tx ID displayed | UI rendered confirmation banner with Transaction ID | **PASS** |
| **TC-14** | Frontend | Form validation | Submit form with empty parcel ID | Form blocks submission; error message displayed | Inline validation error displayed; 0 invalid requests sent | **PASS** |
| **TC-15** | Integration | Full end-to-end lifecycle | Create -> Search -> Transfer -> Review -> Audit | Ledger reflects changes across all pages | All 4 pages synced with verified ledger state | **PASS** |

---

## 6. Live Demonstration Script (3–5 Minutes)

### Phase 1: Architecture & Network Brief (Speaker 1)
- "Good morning. Our project is a Privacy-Preserving Consortium Blockchain Framework for Digital Land Registry and Title Verification. We use Hyperledger Fabric because land title records require strong access governance and auditable state transitions."
- "The network operates on channel `landchannel` with smart contract `landregistry`. In accordance with privacy requirements, original deeds are maintained off-chain while deterministic document hashes (`documentHash`) are committed on-chain."

### Phase 2: Property Creation & Confirmation (Speaker 2)
- Open **Register Property** page.
- Click **Fill TN-CHN-001 (Demo)** or input:
  - Parcel ID: `TN-CHN-001`
  - Survey Number: `114/2A`
  - Owner: `Ravi Kumar` (`OWNER-001`)
  - Document Hash: `4b2e7c9a11d3`
  - Role: `REGISTRATION_OFFICER`
- Click **Register on Blockchain**.
- Point to the green confirmation callout displaying the generated blockchain **Transaction ID**.

### Phase 3: Cadastral Search & Title Verification (Speaker 2)
- Navigate to **Property Search & History**.
- Enter `TN-CHN-001` and click **Search Ledger**.
- Display title state: Title Status: **Active Title** (Green), Transfer Status: **No Pending Transfer**.

### Phase 4: Title Transfer Initiation (Speaker 2)
- Switch active role to `LAND_OWNER`.
- Under **Submit Title Transfer Request**, input:
  - Current Owner: `OWNER-001`
  - Proposed Buyer: `BUYER-001` (`Priya Menon`)
- Click **Submit Transfer Request**.
- Show status transition to **Pending Officer Review** (Amber).

### Phase 5: Officer Review & Approval (Speaker 2 & Speaker 1)
- Switch active role to `REGISTRATION_OFFICER`.
- Navigate to **Transfer Review** page.
- Locate parcel `TN-CHN-001` in the pending queue.
- Click **Approve Transfer**.
- Point to the approval Transaction ID confirming the state transition on ledger.

### Phase 6: Immutable Audit History Verification (Speaker 1)
- Return to **Property Search & History** for `TN-CHN-001`.
- Scroll to **Immutable Property History Timeline**:
  - Revision 1: Initial property registration by Officer
  - Revision 2: Transfer request submitted by Owner
  - Revision 3: Formal title approval & ownership handover to Priya Menon
- Demonstrate that all historical events remain permanent and tamper-proof.

### Phase 7: Role-Based Access Enforcement Demonstration (Speaker 1)
- Switch role to `LAND_OWNER`.
- Attempt to register a property or approve a pending transfer.
- Point to the returned rejection: *"Only a Registration Officer can perform this action"*.
- Conclude: "This proves that our solution provides end-to-end security, role-based protection, and complete auditability from frontend input to blockchain confirmation."

---

## 7. Viva Examination Q&A Cheat Sheet

1. **Why Hyperledger Fabric instead of public blockchains like Ethereum?**
   *Answer:* Land records are sensitive sovereign data. Public blockchains incur volatile gas fees, lack enterprise privacy controls, and publish all transaction payloads publicly. Hyperledger Fabric offers a permissioned consortium model with private channels, immediate deterministic finality without mining, high transaction throughput, and granular role-based identity management.

2. **How does the system preserve document privacy?**
   *Answer:* Original property titles, sale deeds, and survey blueprints are kept in secure off-chain storage. The ledger stores only the SHA-256 cryptographic hash (`documentHash`). Anyone can verify the integrity and authenticity of a physical deed by comparing its hash against the blockchain record, without exposing sensitive documents on-chain.

3. **What prevents an unauthorized party from approving transfers?**
   *Answer:* Role checks are enforced inside the chaincode smart contract logic (`requestedByRole === 'REGISTRATION_OFFICER'`). Even if an unauthorized caller bypasses the UI or backend, the chaincode transaction execution throws an access denied exception and is rejected by the endorsing peers.

4. **What are the proposed future enhancements?**
   *Answer:* In a production government rollout, future enhancements include:
   - Encrypted IPFS integration for decentralized off-chain document storage.
   - Zero-Knowledge Proofs (ZKPs) for private title verification without revealing ownership.
   - W3C Decentralized Identifiers (DIDs) via Hyperledger Aries/Indy.
   - Integration with banking, court, and revenue department systems.
