#!/usr/bin/env bash
set -euo pipefail

PARCEL_ID="${1:-TN-CHN-001}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TEST_NETWORK_DIR="${ROOT_DIR}/blockchain/fabric-samples/test-network"

cd "${TEST_NETWORK_DIR}"

export PATH="${ROOT_DIR}/blockchain/fabric-samples/bin:${PATH}"
export FABRIC_CFG_PATH="${ROOT_DIR}/blockchain/fabric-samples/config"
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE="${TEST_NETWORK_DIR}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
export CORE_PEER_MSPCONFIGPATH="${TEST_NETWORK_DIR}/organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp"
export CORE_PEER_ADDRESS=localhost:7051

echo "Querying GetProperty for ${PARCEL_ID} on landchannel..."
peer chaincode query \
  -C landchannel \
  -n landregistry \
  -c "{\"function\":\"GetProperty\",\"Args\":[\"${PARCEL_ID}\"]}"
