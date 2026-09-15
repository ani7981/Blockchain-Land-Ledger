#!/usr/bin/env bash
set -euo pipefail

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

echo "Invoking CreateProperty on landchannel..."
peer chaincode invoke \
  -o localhost:7050 \
  --ordererTLSHostnameOverride orderer.example.com \
  --tls \
  --cafile "${TEST_NETWORK_DIR}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" \
  -C landchannel \
  -n landregistry \
  --peerAddresses localhost:7051 \
  --tlsRootCertFiles "${TEST_NETWORK_DIR}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" \
  --peerAddresses localhost:9051 \
  --tlsRootCertFiles "${TEST_NETWORK_DIR}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" \
  -c '{"function":"CreateProperty","Args":["TN-CLI-001","99/1A","OWNER-CLI","Karthik Raman","Residential","9f8e7d6c5b4a","REGISTRATION_OFFICER","OFFICER-001"]}'
