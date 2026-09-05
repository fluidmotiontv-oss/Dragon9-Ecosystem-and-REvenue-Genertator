#!/bin/bash
# ==============================================================================
# DRAGON 9: MASTER IP ARCHIVE & CHAIN OF CUSTODY GENERATOR
# ==============================================================================
# This script performs the automated code archiving described in Step 2 of the
# IP Classification Matrix. It generates cryptographic SHA-256 hashes for all 
# relevant IP files and bundles the ecosystem into a secure cold-storage tarball.
# ==============================================================================

set -e

ARCHIVE_DATE=$(date +%Y%m%d_%H%M%S)
MANIFEST_FILE="IP_MANIFEST_SHA256_${ARCHIVE_DATE}.txt"
ARCHIVE_NAME="dragon9_ip_master_record_${ARCHIVE_DATE}.tar.gz"

echo "[*] INITIATING DRAGON 9 IP ARCHIVAL PROTOCOL..."

# 1. Generate Git Commit Hashes & Tags (if initialized)
if [ -d ".git" ]; then
    echo "[*] Git repository detected. Tagging current state as IP Baseline."
    # Check if there are changes
    if ! git diff-index --quiet HEAD --; then
        echo "[!] Uncommitted changes found. Committing to baseline..."
        git add .
        git commit -m "Auto-commit: Preparing for Master IP Baseline Archive"
    fi
    # Create the tag
    git tag -a "v1.0-IP-RELEASE-${ARCHIVE_DATE}" -m "Master IP Baseline Archive - ${ARCHIVE_DATE}"
    echo "[+] Tag created: v1.0-IP-RELEASE-${ARCHIVE_DATE}"
else
    echo "[-] No Git repository detected. Skipping tagging..."
fi

# 2. Generate Cryptographic Hashes (SHA-256)
echo "[*] Generating Cryptographic SHA-256 Manifest for IP Chain of Custody..."
find . -type f \( -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.py" -o -name "*.sh" -o -name "*.html" -o -name "*.md" \) \
    -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/.git/*" \
    -exec sha256sum {} + > "${MANIFEST_FILE}"
echo "[+] Manifest created: ${MANIFEST_FILE}"

# 3. Export Clean Source Bundle
echo "[*] Compiling immutable source archive for cold storage..."
tar -czvf "${ARCHIVE_NAME}" \
    --exclude="node_modules" \
    --exclude="dist" \
    --exclude=".git" \
    --exclude=".env" \
    . > /dev/null
echo "[+] Asset Bundle exported: ${ARCHIVE_NAME}"

echo ""
echo "=============================================================================="
echo "ARCHIVE COMPLETE. SOVEREIGN IP RECORD SECURED."
echo "Manifest : ${MANIFEST_FILE}"
echo "Tarball  : ${ARCHIVE_NAME}"
echo "=============================================================================="
