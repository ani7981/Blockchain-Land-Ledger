# Testing Plan and Evidence Sheet

**Project:** Privacy-Preserving Consortium Blockchain Framework for Digital Land Registry and Title Verification

**Scope:** Blockchain-only MVP. No AI/ML components.

## Test cases

| ID | Module | Test case | Input/action | Expected result | Actual result | Status |
|---|---|---|---|---|---|---|
| TC-01 | Network | Start Fabric network | Run network startup command | Orderer, peers, CAs, and databases start successfully |  |  |
| TC-02 | Channel | Create channel | Create `landchannel` | Channel is created and peers join |  |  |
| TC-03 | Chaincode | Deploy chaincode | Deploy `landregistry` | Chaincode is approved and committed |  |  |
| TC-04 | Property | Create property | Officer creates `TN-CHN-001` | Property is committed with `ACTIVE` status |  |  |
| TC-05 | Property | Reject duplicate | Create `TN-CHN-001` again | Transaction is rejected with duplicate error |  |  |
| TC-06 | Access control | Unauthorized create | Land Owner role calls CreateProperty | Access denied message is returned |  |  |
| TC-07 | Query | Query property | Get `TN-CHN-001` | Current property data is returned |  |  |
| TC-08 | Transfer | Request transfer | Owner requests transfer to `BUYER-001` | Status changes to `PENDING` |  |  |
| TC-09 | Access control | Unauthorized approval | Land Owner attempts approval | Access denied message is returned |  |  |
| TC-10 | Transfer | Approve transfer | Officer approves transfer | Owner becomes `Priya Menon`; status is `APPROVED` |  |  |
| TC-11 | Transfer | Reject transfer | Officer rejects a pending transfer | Current owner remains unchanged; reason is stored |  |  |
| TC-12 | History | Retrieve history | Get history for `TN-CHN-001` | Creation and transfer events are returned |  |  |
| TC-13 | Frontend | Create-property form | Submit valid form | UI displays success and transaction ID |  |  |
| TC-14 | Frontend | Validation | Submit form with empty parcel ID | UI displays validation error; no transaction is sent |  |  |
| TC-15 | Integration | Full workflow | Create -> transfer request -> approve -> history | All stages complete and UI reflects ledger state |  |  |

## Screenshots required

Create a `screenshots/` folder and save evidence with these names:

```text
01_docker_containers_running.png
02_fabric_network_started.png
03_landchannel_created.png
04_chaincode_deployed.png
05_register_property_form.png
06_property_registration_success.png
07_property_search_result.png
08_transfer_request_pending.png
09_transfer_approved.png
10_property_history.png
11_access_control_error.png
12_api_response_success.png
13_github_repository_structure.png
```

## Minimum evidence for viva

1. A terminal showing Fabric containers running.
2. A successful chaincode deployment.
3. A frontend transaction that creates a property.
4. A displayed Fabric transaction ID or confirmation message.
5. A property query result from the UI.
6. A title-transfer approval/rejection action.
7. A history view proving that previous property states remain visible.
8. An access-control failure showing the system rejects an unauthorized action.

## Result statement template

Use this after testing:

> The implemented prototype successfully established a permissioned Hyperledger Fabric network and deployed the `landregistry` chaincode on `landchannel`. The system supported property creation, property queries, title-transfer requests, officer approval/rejection, role-based access validation, and immutable property-history retrieval. The web frontend successfully invoked backend APIs, which interacted with Hyperledger Fabric through the gateway layer. The test results confirmed that the core land-registry workflow functioned from user input to blockchain confirmation.

## Known limitations template

Use this in your documentation and PPT:

> This prototype is a local academic implementation using the Hyperledger Fabric test network. It does not constitute a production government registry. Features such as IPFS deployment, decentralized identity integration, zero-knowledge proofs, fully homomorphic encryption, title tokenization, multi-district scaling, and legal-system integration are proposed as future enhancements.
