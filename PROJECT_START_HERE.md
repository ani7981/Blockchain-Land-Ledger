# Digital Land Registry — Team Starter Pack

**Project title:** A Privacy-Preserving Consortium Blockchain Framework for Digital Land Registry and Title Verification

**Project scope:** Blockchain only. Do **not** add AI/ML components.

**Team members:**
- Member 1 — Blockchain network, chaincode, backend API
- Member 2 — Frontend UI, documentation, PPT, testing evidence

## Goal for the first working prototype

Demonstrate this complete workflow:

```text
Registration Officer creates property
        -> Property stored through Hyperledger Fabric chaincode
        -> User searches parcel ID
        -> Land Owner submits title transfer request
        -> Registration Officer approves or rejects request
        -> Property history shows immutable ledger events
```

## One-day MVP boundary

### Build today
- Hyperledger Fabric test network using Docker
- One channel: `landchannel`
- One chaincode: `landregistry`
- Property creation, query, listing, transfer request, approval, rejection, history
- Role-based checks for Registration Officer and Land Owner
- Web frontend connected through backend REST API
- At least one complete successful title-transfer demo

### Keep as future enhancement only
- Zero-Knowledge Proofs (ZKPs)
- Fully Homomorphic Encryption (FHE)
- Hyperledger Indy/Aries DID integration
- IPFS deployment (store a `documentHash` field only today)
- Tokenized land title implementation
- Bank, court, or legal-authority peer organizations
- Mobile application
- Production cloud deployment

## Repository structure

```text
digital-land-registry/
├── blockchain/
│   ├── chaincode/
│   │   └── landregistry/
│   ├── scripts/
│   └── README.md
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│   ├── package.json
│   └── README.md
├── docs/
│   ├── api-contract.md
│   ├── chaincode-spec.md
│   ├── data-model.md
│   ├── integration-checklist.md
│   ├── testing-plan.md
│   └── demo-script.md
├── screenshots/
├── README.md
└── .gitignore
```

## Git workflow

Create one GitHub repository. Do not work directly on `main`.

```bash
git checkout -b blockchain-backend   # Member 1
git checkout -b frontend-docs        # Member 2
```

- Member 1 owns `blockchain/` and `backend/`.
- Member 2 owns `frontend/`, `docs/`, `screenshots/`, and PPT materials.
- Both members must agree on the files in `docs/` before implementation.
- Merge only after testing the complete flow together.

## Non-negotiable naming

Use these exact names everywhere:

```text
Channel name: landchannel
Chaincode name: landregistry
Asset name: Property
Primary key: parcelId
```

Use these exact status values internally:

```text
titleStatus: ACTIVE | DISPUTED
transferStatus: NONE | PENDING | APPROVED | REJECTED
```

## Ready-to-start order

1. Read `docs/data-model.md`.
2. Read `docs/chaincode-spec.md`.
3. Read `docs/api-contract.md` together.
4. Member 1 starts Fabric setup and chaincode.
5. Member 2 starts frontend with mock responses from `docs/api-contract.md`.
6. Replace mocks with the real backend only after the backend endpoints are tested.
7. Follow `docs/integration-checklist.md`.
8. Capture evidence according to `docs/testing-plan.md`.
9. Rehearse with `docs/demo-script.md`.
