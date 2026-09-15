# Two-Person Demonstration Script

**Project:** A Privacy-Preserving Consortium Blockchain Framework for Digital Land Registry and Title Verification

**Duration:** 3–5 minutes

**Rule:** Do not mention AI. The project is blockchain-only.

## Before starting the demo

- Keep Fabric Docker containers running.
- Keep the frontend open in the browser.
- Keep the backend terminal visible in a second window.
- Use the fixed parcel ID: `TN-CHN-001`.
- Use the fixed owner: `Ravi Kumar`, `OWNER-001`.
- Use the fixed buyer: `Priya Menon`, `BUYER-001`.
- Have Property History ready to open.

## Speaker 1 — Blockchain and backend

> Good morning. Our project is a Privacy-Preserving Consortium Blockchain Framework for Digital Land Registry and Title Verification. We use Hyperledger Fabric because land-title data is sensitive and must be shared only among authorized institutions.

> The network is implemented as a permissioned consortium blockchain. It contains peer organizations representing the Registration Office and Survey Department, an ordering service, identity certificates, and a channel named `landchannel`.

> We deployed our `landregistry` chaincode on this channel. The chaincode implements property registration, property lookup, title-transfer request, title-transfer approval or rejection, and immutable property-history retrieval.

Show terminal briefly:

```text
docker ps
```

> These containers show the local Hyperledger Fabric network running. The application does not store original property documents directly on the ledger. It stores a document hash, which allows integrity verification while reducing exposure of sensitive documents.

## Speaker 2 — Frontend and workflow

> This is the web interface. It connects to our backend API, and the backend communicates with the Fabric network using the Fabric Gateway. The browser never receives blockchain certificates or private keys.

### Step 1: Create property

Open **Register Property** and enter:

```text
Parcel ID: TN-CHN-001
Survey Number: 114/2A
Owner ID: OWNER-001
Owner Name: Ravi Kumar
Property Type: Residential
Document Hash: 4b2e7c9a11d3
Role: REGISTRATION_OFFICER
```

> We are creating an initial property asset. Only a Registration Officer is allowed to perform this action.

Click **Register on Blockchain**.

> The frontend has submitted the request. The backend invoked the `CreateProperty` chaincode function. The transaction has now been confirmed, and the property is stored on the ledger.

Show transaction ID/success message.

### Step 2: Query property

Open **Search Property** and search:

```text
TN-CHN-001
```

> The system retrieves the latest state directly through the blockchain-connected backend. We can see the owner, survey number, document hash, active title status, and transfer status.

### Step 3: Request transfer

Open **Submit Transfer** and enter:

```text
Parcel ID: TN-CHN-001
Current Owner ID: OWNER-001
Buyer ID: BUYER-001
Buyer Name: Priya Menon
Role: LAND_OWNER
```

> The current land owner requests a title transfer. The chaincode validates that the request is made by the current owner and changes the transfer status to `PENDING`.

### Step 4: Approve transfer

Open **Transfer Review**.

> The Registration Officer reviews the pending request. Only this authorized role can approve or reject the transfer.

Click **Approve Transfer**.

> The `ApproveTitleTransfer` chaincode function changes the current owner from Ravi Kumar to Priya Menon and creates another immutable ledger event.

### Step 5: Show history

Open **Property History** for `TN-CHN-001`.

> This is the key blockchain feature of our project. The system shows the chronological history of the parcel: initial creation, transfer request, and final approval. Previous states remain available for verification, providing a transparent and tamper-resistant audit trail.

## Speaker 1 — Access control proof

> To demonstrate access control, we can try to create a property using the Land Owner role. The chaincode rejects it because only a Registration Officer has permission to create property records.

Show access-denied error.

> This demonstrates that our solution provides a secure, permissioned, and auditable land-registry workflow from frontend input to blockchain confirmation.

## Closing line

> In future work, the system can integrate IPFS for encrypted off-chain document storage, decentralized identity, and more advanced privacy mechanisms. For this prototype, we focused on a functional consortium blockchain network, chaincode business logic, secure frontend integration, role-based control, and end-to-end title verification.
