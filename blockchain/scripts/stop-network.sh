#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
TEST_NETWORK_DIR="${ROOT_DIR}/blockchain/fabric-samples/test-network"

echo "Tearing down Hyperledger Fabric network..."
cd "${TEST_NETWORK_DIR}"
./network.sh down
echo "Network down completed."
