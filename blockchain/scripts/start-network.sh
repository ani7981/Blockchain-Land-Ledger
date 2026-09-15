#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TEST_NETWORK_DIR="${ROOT_DIR}/blockchain/fabric-samples/test-network"
CHAINCODE_PATH="${ROOT_DIR}/blockchain/chaincode/landregistry"

echo "=========================================================="
echo "  Starting Digital Land Registry Hyperledger Fabric Network"
echo "  Channel: landchannel | Chaincode: landregistry          "
echo "=========================================================="

cd "${TEST_NETWORK_DIR}"

# 1. Bring down any old containers
echo "[Step 1/3] Bringing down existing test-network containers..."
./network.sh down || true

# 2. Start network and create channel landchannel
echo "[Step 2/3] Creating consortium channel: landchannel..."
./network.sh up createChannel -c landchannel -ca

# 3. Deploy chaincode landregistry
echo "[Step 3/3] Deploying landregistry chaincode to landchannel..."
./network.sh deployCC \
  -ccn landregistry \
  -ccp "${CHAINCODE_PATH}" \
  -ccl javascript \
  -c landchannel

echo "=========================================================="
echo "  Hyperledger Fabric Network Started Successfully!        "
echo "=========================================================="
