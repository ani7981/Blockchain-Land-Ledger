# Final Integration Checklist

Use this checklist 2–3 hours before the deadline. Do not postpone first integration until the last hour.

## Before integration

- [ ] Both members read `api-contract.md`.
- [ ] Both members use `parcelId`, not `propertyId` or `landId`.
- [ ] Both members use exact status constants from `data-model.md`.
- [ ] Person 1 has tested every backend endpoint using Postman, Thunder Client, or curl.
- [ ] Person 2 has finished all UI pages using mock API data.
- [ ] Person 2 has isolated all requests in one API service file.
- [ ] Fabric network is running.
- [ ] Chaincode `landregistry` is deployed to `landchannel`.

## Start the Fabric test network

From the Fabric samples test-network directory:

```bash
./network.sh down
./network.sh up createChannel -c landchannel -ca
```

Deploy the chaincode after Person 1 has completed it:

```bash
./network.sh deployCC \
  -ccn landregistry \
  -ccp ../chaincode/landregistry \
  -ccl javascript \
  -c landchannel
```

> Adjust the chaincode path based on your repository location.

## Start application services

### Terminal 1 — Fabric network

```bash
cd fabric-samples/test-network
./network.sh up createChannel -c landchannel -ca
```

### Terminal 2 — Backend

```bash
cd backend
npm install
npm run dev
```

Expected backend URL:

```text
http://localhost:3000
```

### Terminal 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Expected frontend URL is normally shown by Vite, often:

```text
http://localhost:5173
```

## Frontend changes during handoff

Only replace mock-service functions in:

```text
frontend/src/services/api.js
```

Do not edit page components unless the final API contract actually changed.

Replace:

```javascript
return mockResponse;
```

With:

```javascript
const response = await fetch(`${API_BASE_URL}/api/properties`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
return response.json();
```

## End-to-end test flow

### Test 1 — Create property

- [ ] Choose role `REGISTRATION_OFFICER`.
- [ ] Create parcel `TN-CHN-001`.
- [ ] Confirm a success message appears.
- [ ] Confirm transaction ID is shown.
- [ ] Search for `TN-CHN-001`.
- [ ] Confirm owner is `Ravi Kumar`.
- [ ] Confirm `titleStatus = ACTIVE`.
- [ ] Confirm `transferStatus = NONE`.

### Test 2 — Request title transfer

- [ ] Choose role `LAND_OWNER`.
- [ ] Submit transfer to `BUYER-001`, `Priya Menon`.
- [ ] Confirm `transferStatus = PENDING`.
- [ ] Confirm pending buyer is shown.

### Test 3 — Approve title transfer

- [ ] Choose role `REGISTRATION_OFFICER`.
- [ ] Approve transfer for `TN-CHN-001`.
- [ ] Confirm owner changes to `Priya Menon`.
- [ ] Confirm `ownerId = BUYER-001`.
- [ ] Confirm `transferStatus = APPROVED`.

### Test 4 — Blockchain history

- [ ] Open Property History for `TN-CHN-001`.
- [ ] Confirm property creation appears.
- [ ] Confirm transfer request appears.
- [ ] Confirm transfer approval appears.
- [ ] Capture screenshot.

### Test 5 — Access-control failure

- [ ] Attempt to create a property using role `LAND_OWNER`.
- [ ] Confirm error: `Only a Registration Officer can create a property`.
- [ ] Capture screenshot or API response.

## Evidence to capture

- [ ] `docker ps` showing Fabric containers.
- [ ] Network/channel startup terminal output.
- [ ] Successful chaincode deployment output.
- [ ] Create-property UI form.
- [ ] Successful registration with transaction ID.
- [ ] Property-search result.
- [ ] Pending-transfer page.
- [ ] Approved-transfer page.
- [ ] Property-history timeline.
- [ ] Access denied error.
- [ ] Postman/Thunder Client response for one successful transaction.
- [ ] GitHub repository structure.

## Common integration fixes

| Symptom | Likely cause | Fix |
|---|---|---|
| CORS error in browser | Backend does not allow frontend origin | Enable CORS in Express/FastAPI |
| `404 Not Found` | Wrong endpoint path | Match `api-contract.md` exactly |
| `Property does not exist` | Incorrect parcel ID or property never committed | Recreate `TN-CHN-001`, then query again |
| Chaincode function not found | Function name mismatch | Match chaincode and backend names exactly |
| Frontend shows undefined values | Response shape mismatch | Return `{ success, message, transactionId, data }` |
| Fabric gateway error | Wrong certificate, wallet, or connection profile path | Validate gateway configuration before integration |
| Transaction rejected | Role/status validation works correctly | Check role value and current transfer status |
