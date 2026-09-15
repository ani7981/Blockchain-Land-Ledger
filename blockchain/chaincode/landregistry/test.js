'use strict';

const assert = require('assert');
const LandRegistryContract = require('./landRegistryContract');

class MockStub {
  constructor() {
    this.state = new Map();
    this.history = new Map();
    this.txId = 'TX-INIT-000';
    this.timestamp = { seconds: { low: Math.floor(Date.now() / 1000) } };
  }

  setTxId(id) {
    this.txId = id;
  }

  getTxId() {
    return this.txId;
  }

  getTxTimestamp() {
    return this.timestamp;
  }

  async putState(key, value) {
    this.state.set(key, value);
    if (!this.history.has(key)) {
      this.history.set(key, []);
    }
    this.history.get(key).push({
      txId: this.txId,
      timestamp: this.timestamp,
      isDelete: false,
      value: value
    });
  }

  async getState(key) {
    return this.state.get(key) || Buffer.from('');
  }

  async getStateByRange(startKey, endKey) {
    const entries = Array.from(this.state.entries());
    let index = 0;
    return {
      next: async () => {
        if (index < entries.length) {
          const [k, v] = entries[index++];
          return { done: false, value: { key: k, value: v } };
        }
        return { done: true };
      },
      close: async () => {}
    };
  }

  async getHistoryForKey(key) {
    const records = this.history.get(key) || [];
    let index = 0;
    return {
      next: async () => {
        if (index < records.length) {
          const rec = records[index++];
          return { done: false, value: rec };
        }
        return { done: true };
      },
      close: async () => {}
    };
  }
}

async function runTests() {
  console.log('--- Starting LandRegistryContract Verification Tests ---');
  const contract = new LandRegistryContract();
  const stub = new MockStub();
  const ctx = { stub };

  // Test 1: CreateProperty as REGISTRATION_OFFICER
  stub.setTxId('TX-CREATE-001');
  const res1 = await contract.CreateProperty(
    ctx,
    'TN-CHN-001',
    '114/2A',
    'OWNER-001',
    'Ravi Kumar',
    'Residential',
    '4b2e7c9a11d3',
    'REGISTRATION_OFFICER',
    'OFFICER-001'
  );
  const prop1 = JSON.parse(res1);
  assert.strictEqual(prop1.parcelId, 'TN-CHN-001');
  assert.strictEqual(prop1.ownerName, 'Ravi Kumar');
  assert.strictEqual(prop1.titleStatus, 'ACTIVE');
  assert.strictEqual(prop1.transferStatus, 'NONE');
  console.log('✓ TC-04 Passed: CreateProperty as REGISTRATION_OFFICER');

  // Test 2: Reject duplicate property
  try {
    await contract.CreateProperty(
      ctx,
      'TN-CHN-001',
      '114/2A',
      'OWNER-001',
      'Ravi Kumar',
      'Residential',
      '4b2e7c9a11d3',
      'REGISTRATION_OFFICER',
      'OFFICER-001'
    );
    assert.fail('Should have failed duplicate check');
  } catch (err) {
    assert(err.message.includes('already exists'));
    console.log('✓ TC-05 Passed: Reject duplicate property');
  }

  // Test 3: Reject unauthorized create by LAND_OWNER
  try {
    await contract.CreateProperty(
      ctx,
      'TN-CHN-002',
      '216/4B',
      'OWNER-002',
      'Meera Iyer',
      'Commercial',
      'f9354be02d6c',
      'LAND_OWNER',
      'OWNER-002'
    );
    assert.fail('Should have rejected unauthorized create');
  } catch (err) {
    assert(err.message.includes('Only a Registration Officer can create a property'));
    console.log('✓ TC-06 Passed: Reject unauthorized create by LAND_OWNER');
  }

  // Test 4: Query property
  const res4 = await contract.GetProperty(ctx, 'TN-CHN-001');
  const prop4 = JSON.parse(res4);
  assert.strictEqual(prop4.parcelId, 'TN-CHN-001');
  console.log('✓ TC-07 Passed: Query property GetProperty');

  // Test 5: Request title transfer
  stub.setTxId('TX-TRANSFER-REQ-001');
  const res5 = await contract.RequestTitleTransfer(
    ctx,
    'TN-CHN-001',
    'OWNER-001',
    'BUYER-001',
    'Priya Menon',
    'LAND_OWNER'
  );
  const prop5 = JSON.parse(res5);
  assert.strictEqual(prop5.transferStatus, 'PENDING');
  assert.strictEqual(prop5.pendingBuyerName, 'Priya Menon');
  console.log('✓ TC-08 Passed: Request title transfer');

  // Test 6: Reject unauthorized approval attempt by LAND_OWNER
  try {
    await contract.ApproveTitleTransfer(ctx, 'TN-CHN-001', 'LAND_OWNER', 'OWNER-001');
    assert.fail('Should have rejected unauthorized approval');
  } catch (err) {
    assert(err.message.includes('Only a Registration Officer can approve a title transfer'));
    console.log('✓ TC-09 Passed: Reject unauthorized approval attempt');
  }

  // Test 7: Approve title transfer as REGISTRATION_OFFICER
  stub.setTxId('TX-TRANSFER-APP-001');
  const res7 = await contract.ApproveTitleTransfer(ctx, 'TN-CHN-001', 'REGISTRATION_OFFICER', 'OFFICER-001');
  const prop7 = JSON.parse(res7);
  assert.strictEqual(prop7.ownerId, 'BUYER-001');
  assert.strictEqual(prop7.ownerName, 'Priya Menon');
  assert.strictEqual(prop7.transferStatus, 'APPROVED');
  assert.strictEqual(prop7.pendingBuyerId, '');
  console.log('✓ TC-10 Passed: Approve title transfer');

  // Test 8: Property History
  const historyRes = await contract.GetPropertyHistory(ctx, 'TN-CHN-001');
  const history = JSON.parse(historyRes);
  assert.strictEqual(history.length, 3);
  assert.strictEqual(history[0].transactionId, 'TX-CREATE-001');
  assert.strictEqual(history[1].transactionId, 'TX-TRANSFER-REQ-001');
  assert.strictEqual(history[2].transactionId, 'TX-TRANSFER-APP-001');
  console.log('✓ TC-12 Passed: Retrieve full immutable property history');

  // Test 9: Rejection flow with property 2
  stub.setTxId('TX-CREATE-002');
  await contract.CreateProperty(
    ctx,
    'TN-CHN-002',
    '216/4B',
    'OWNER-002',
    'Meera Iyer',
    'Commercial',
    'f9354be02d6c',
    'REGISTRATION_OFFICER',
    'OFFICER-001'
  );
  await contract.RequestTitleTransfer(ctx, 'TN-CHN-002', 'OWNER-002', 'BUYER-002', 'Arjun Das', 'LAND_OWNER');
  const rejRes = await contract.RejectTitleTransfer(
    ctx,
    'TN-CHN-002',
    'Survey verification incomplete',
    'REGISTRATION_OFFICER',
    'OFFICER-001'
  );
  const propRej = JSON.parse(rejRes);
  assert.strictEqual(propRej.transferStatus, 'REJECTED');
  assert.strictEqual(propRej.ownerName, 'Meera Iyer'); // Owner unchanged
  assert.strictEqual(propRej.rejectionReason, 'Survey verification incomplete');
  console.log('✓ TC-11 Passed: Reject title transfer with reason recorded');

  // Test 10: GetAllProperties
  const allProps = JSON.parse(await contract.GetAllProperties(ctx));
  assert.strictEqual(allProps.length, 2);
  console.log('✓ GetAllProperties returns all assets');

  console.log('--- ALL CHAINCODE TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
