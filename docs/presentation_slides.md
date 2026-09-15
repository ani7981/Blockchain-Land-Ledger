# Digital Land Registry — Presentation Slide Deck (PPT Guide)

**Project Title:** A Privacy-Preserving Consortium Blockchain Framework for Digital Land Registry and Title Verification  
**Target Duration:** 8–10 Minutes + Q&A  
**Team Members:** Member 1 (Blockchain & Backend) & Member 2 (Frontend & Quality Assurance)

---

## Slide 1: Title Slide
- **Title:** Digital Land Registry & Title Verification System
- **Subtitle:** A Privacy-Preserving Consortium Blockchain Framework
- **Technology Stack:** Hyperledger Fabric | Node.js Express Gateway | React UI
- **Consortium Scope:** Blockchain-Only Architecture (No AI/ML)
- **Presenter Names:** Member 1 & Member 2

---

## Slide 2: Problem Statement & Motivation
- **Centralized Vulnerabilities:** Single point of failure, manual registry delays, risk of registry database tampering.
- **Double-Selling & Fraud:** Inability for buyers to instantly verify legitimate, unencumbered ownership.
- **Privacy vs Transparency Conflict:** Public blockchains leak sensitive personal citizen data; closed registries lack external auditability.
- **Our Solution:** A permissioned consortium blockchain network with role-governed state transitions and off-chain document hashing.

---

## Slide 3: System Architecture
```text
  [ Citizens / Owners / Officers ]
                 |
                 v
  [ React Web Interface (Vite) ]
  - Dashboard | Register | Search & History | Review
                 |
                 v HTTP REST
  [ Express Gateway API (Node.js) ]
  - Validation | RBAC Middleware | Tx Serialization
                 |
                 v gRPC Fabric Gateway
  [ Hyperledger Fabric Consortium ]
  - Channel: landchannel
  - Peers: Org1 (Registration) & Org2 (Survey)
  - Raft Ordering Service (orderer.example.com)
  - Chaincode: landregistry
```
- **Key Takeaway:** Modular 3-tier architecture isolating private keys from user browsers while guaranteeing deterministic ledger commits.

---

## Slide 4: Network Setup & Topology
- **Permissioned Channel:** `landchannel`
- **Participating Organizations:**
  - **Org1 (Registration Department):** Enforces title registry, approval, and legal compliance.
  - **Org2 (Survey Department):** Validates cadastral boundaries, survey numbers, and geo-data.
  - **Consortium Orderer:** Raft consensus cluster ensuring crash fault tolerance and immutable block ordering.
- **Smart Contract Deployment:** `landregistry` chaincode committed to `landchannel`.

---

## Slide 5: Data Model & Privacy-Preserving Protocol
- **On-Chain Property Asset:**
  - Primary Key: `parcelId` (e.g. `TN-CHN-001`)
  - Cadastral Reference: `surveyNumber` (e.g. `114/2A`)
  - Ownership: `ownerId`, `ownerName`
  - Lifecycle: `titleStatus` (`ACTIVE` / `DISPUTED`), `transferStatus` (`NONE` / `PENDING` / `APPROVED` / `REJECTED`)
  - Audit Trail: `createdAt`, `updatedAt`, `createdBy`
- **Privacy Rule:** Original deeds, physical contracts, and ID documents are NEVER uploaded on-chain. Only their SHA-256 `documentHash` is stored, enabling mathematical verification without document exposure.

---

## Slide 6: Chaincode Smart Contract Functions
| Function Name | Authorized Role | Description |
|---|---|---|
| `CreateProperty` | `REGISTRATION_OFFICER` | Validates parcel uniqueness and creates genesis title |
| `GetProperty` | Any Role | Queries current state of parcel by key |
| `GetAllProperties` | Any Role | Range query over world state |
| `RequestTitleTransfer` | `LAND_OWNER` | Initiates transfer; sets status to `PENDING` |
| `ApproveTitleTransfer` | `REGISTRATION_OFFICER` | Completes transfer; switches owner to buyer |
| `RejectTitleTransfer` | `REGISTRATION_OFFICER` | Denies transfer with recorded reason |
| `GetPropertyHistory` | Any Role | Full chronological audit trail via `getHistoryForKey` |

---

## Slide 7: Frontend Interface & Validation
- **Dashboard:** Live metrics overview, active titles count, pending review alerts, and full ledger asset directory.
- **Register Property:** Form with mandatory validations:
  - Parcel ID (Required)
  - Survey Number (Required)
  - Owner ID & Name (Required)
  - Document Hash (Required)
- **Role Selector:** Switch between `REGISTRATION_OFFICER` and `LAND_OWNER` to test access controls.

---

## Slide 8: Live Demonstration — Step-by-Step Flow
1. **Officer Login & Registration:** Officer submits `TN-CHN-001`. Ledger confirms with Transaction ID `TX-CREATE-...`.
2. **Search & Verification:** Public user searches `TN-CHN-001` and verifies `titleStatus = ACTIVE`.
3. **Owner Transfer Request:** Owner initiates transfer to Priya Menon (`BUYER-001`). Status changes to `PENDING`.
4. **Officer Review & Decision:** Registration Officer reviews application in Transfer Review and approves.
5. **Ownership Handover:** Title transfers to Priya Menon; status updates to `APPROVED`.
6. **Immutable Audit History:** System displays all 3 historical state transitions with immutable block timestamps.

---

## Slide 9: Access Control & Security Evidence
- **Test Case TC-06:** Citizen/Land Owner attempts `CreateProperty` &rarr; **Chaincode Rejection: 403 Access Denied**.
- **Test Case TC-09:** Citizen attempts `ApproveTitleTransfer` &rarr; **Chaincode Rejection: 403 Access Denied**.
- **Test Case TC-05:** Attempting duplicate registration of `TN-CHN-001` &rarr; **Chaincode Rejection: 409 Conflict**.
- **Result:** Proof that business rules are enforced cryptographically in chaincode, not merely client-side.

---

## Slide 10: Conclusion & Future Roadmap
- **Conclusion:** Successfully built and verified a full-stack consortium blockchain land registry with Hyperledger Fabric, REST API gateway, and React interface.
- **Future Enhancements:**
  - Encrypted IPFS off-chain storage for full deed retrieval
  - Zero-Knowledge Proofs (ZKP) for private ownership proofs
  - W3C Decentralized Identifiers (DID) integration
  - Inter-organization smart contracts with banks and judiciary courts
