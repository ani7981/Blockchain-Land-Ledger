'use strict';

const assert = require('assert');
const http = require('http');
const app = require('../src/server');

let server;
const PORT = 3099;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function makeRequest(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runApiTests() {
  console.log('=====================================================');
  console.log('  STARTING REST API ENDPOINT INTEGRATION TESTS');
  console.log('=====================================================');

  server = app.listen(PORT);
  await new Promise(r => setTimeout(r, 200));

  try {
    // 1. Health check
    const health = await makeRequest('/api/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.data.status, 'UP');
    console.log('✓ TC-API-01: Health check endpoint passed');

    // 2. Form validation error on empty fields
    const valErr = await makeRequest('/api/properties', { method: 'POST' }, {
      parcelId: '',
      surveyNumber: '114/2A',
      ownerId: 'OWNER-001',
      ownerName: 'Ravi Kumar',
      documentHash: '4b2e7c9a11d3'
    });
    assert.strictEqual(valErr.status, 400);
    assert.strictEqual(valErr.data.errorCode, 'VALIDATION_ERROR');
    console.log('✓ TC-API-02 (TC-14): Form validation error on empty parcelId passed');

    // 3. Unauthorized property creation by LAND_OWNER
    const unauthCreate = await makeRequest('/api/properties', { method: 'POST' }, {
      parcelId: 'TN-TEST-999',
      surveyNumber: '999/1',
      ownerId: 'OWNER-999',
      ownerName: 'Test Owner',
      propertyType: 'Residential',
      documentHash: 'hash999',
      requestedByRole: 'LAND_OWNER'
    });
    assert.strictEqual(unauthCreate.status, 403);
    assert.strictEqual(unauthCreate.data.errorCode, 'ACCESS_DENIED');
    console.log('✓ TC-API-03 (TC-06): Role check rejects property creation by LAND_OWNER');

    // 4. Successful property creation by REGISTRATION_OFFICER
    const createRes = await makeRequest('/api/properties', { method: 'POST' }, {
      parcelId: 'TN-DEL-101',
      surveyNumber: '55/3B',
      ownerId: 'OWNER-101',
      ownerName: 'Vikram Seth',
      propertyType: 'Residential',
      documentHash: 'a7b8c9d0e1f2',
      requestedByRole: 'REGISTRATION_OFFICER',
      officerId: 'OFFICER-001'
    });
    assert.strictEqual(createRes.status, 201);
    assert.strictEqual(createRes.data.success, true);
    assert(createRes.data.transactionId.startsWith('TX-CREATE-'));
    assert.strictEqual(createRes.data.data.parcelId, 'TN-DEL-101');
    assert.strictEqual(createRes.data.data.titleStatus, 'ACTIVE');
    assert.strictEqual(createRes.data.data.transferStatus, 'NONE');
    console.log('✓ TC-API-04 (TC-04, TC-13): Successful property registration on blockchain');

    // 5. Reject duplicate property creation
    const dupRes = await makeRequest('/api/properties', { method: 'POST' }, {
      parcelId: 'TN-DEL-101',
      surveyNumber: '55/3B',
      ownerId: 'OWNER-101',
      ownerName: 'Vikram Seth',
      propertyType: 'Residential',
      documentHash: 'a7b8c9d0e1f2',
      requestedByRole: 'REGISTRATION_OFFICER'
    });
    assert.strictEqual(dupRes.status, 409);
    assert.strictEqual(dupRes.data.errorCode, 'CONFLICT');
    console.log('✓ TC-API-05 (TC-05): Duplicate parcel registration rejected with 409 CONFLICT');

    // 6. Get All Properties
    const allProps = await makeRequest('/api/properties');
    assert.strictEqual(allProps.status, 200);
    assert(Array.isArray(allProps.data.data));
    assert(allProps.data.data.length >= 4);
    console.log(`✓ TC-API-06: GetAllProperties returned ${allProps.data.data.length} registered properties`);

    // 7. Get Property by parcel ID
    const getProp = await makeRequest('/api/properties/TN-DEL-101');
    assert.strictEqual(getProp.status, 200);
    assert.strictEqual(getProp.data.data.parcelId, 'TN-DEL-101');
    assert.strictEqual(getProp.data.data.ownerName, 'Vikram Seth');
    console.log('✓ TC-API-07 (TC-07): Query property by ID succeeded');

    // 8. Query non-existent property
    const notFoundProp = await makeRequest('/api/properties/NON-EXISTENT-999');
    assert.strictEqual(notFoundProp.status, 404);
    assert.strictEqual(notFoundProp.data.errorCode, 'NOT_FOUND');
    console.log('✓ TC-API-08: Non-existent parcel returns 404 NOT_FOUND');

    // 9. Request title transfer as LAND_OWNER
    const transferReq = await makeRequest('/api/properties/TN-DEL-101/transfer', { method: 'POST' }, {
      currentOwnerId: 'OWNER-101',
      buyerId: 'BUYER-202',
      buyerName: 'Ananya Roy',
      requestedByRole: 'LAND_OWNER'
    });
    assert.strictEqual(transferReq.status, 200);
    assert.strictEqual(transferReq.data.data.transferStatus, 'PENDING');
    assert.strictEqual(transferReq.data.data.pendingBuyerName, 'Ananya Roy');
    console.log('✓ TC-API-09 (TC-08): Title transfer request submitted with status PENDING');

    // 10. Reject unauthorized approval by LAND_OWNER
    const unauthApprove = await makeRequest('/api/properties/TN-DEL-101/approve', { method: 'POST' }, {
      officerId: 'OWNER-101',
      requestedByRole: 'LAND_OWNER'
    });
    assert.strictEqual(unauthApprove.status, 403);
    assert.strictEqual(unauthApprove.data.errorCode, 'ACCESS_DENIED');
    console.log('✓ TC-API-10 (TC-09): Transfer approval by LAND_OWNER rejected with 403');

    // 11. Approve title transfer as REGISTRATION_OFFICER
    const approveRes = await makeRequest('/api/properties/TN-DEL-101/approve', { method: 'POST' }, {
      officerId: 'OFFICER-001',
      requestedByRole: 'REGISTRATION_OFFICER'
    });
    assert.strictEqual(approveRes.status, 200);
    assert.strictEqual(approveRes.data.data.transferStatus, 'APPROVED');
    assert.strictEqual(approveRes.data.data.ownerName, 'Ananya Roy');
    assert.strictEqual(approveRes.data.data.ownerId, 'BUYER-202');
    console.log('✓ TC-API-11 (TC-10): Transfer approved by REGISTRATION_OFFICER; ownership updated');

    // 12. Query property history
    const historyRes = await makeRequest('/api/properties/TN-DEL-101/history');
    assert.strictEqual(historyRes.status, 200);
    const history = historyRes.data.data;
    assert.strictEqual(history.length, 3);
    assert(history[0].transactionId.startsWith('TX-CREATE-'));
    assert(history[1].transactionId.startsWith('TX-TRANSFER-REQUEST-'));
    assert(history[2].transactionId.startsWith('TX-TRANSFER-APPROVE-'));
    console.log('✓ TC-API-12 (TC-12): Property history returned 3 chronological state versions');

    // 13. Dashboard summary
    const summaryRes = await makeRequest('/api/dashboard/summary');
    assert.strictEqual(summaryRes.status, 200);
    assert(summaryRes.data.data.totalProperties >= 4);
    assert(summaryRes.data.data.activeTitles >= 3);
    console.log('✓ TC-API-13: Dashboard metrics summary verified');

    console.log('=====================================================');
    console.log('  ALL API ENDPOINT INTEGRATION TESTS PASSED (13/13)  ');
    console.log('=====================================================');
  } finally {
    if (server) {
      server.close();
    }
  }
}

runApiTests().catch((err) => {
  console.error('API Test Failure:', err);
  if (server) server.close();
  process.exit(1);
});
