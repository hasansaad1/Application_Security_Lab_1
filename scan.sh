#!/bin/bash
set -e # Stop script immediately on error

# ==========================================
# 1. PRE-FLIGHT CHECK: Verify Secret Files
# ==========================================
echo "[*] Checking for required secret files..."
REQUIRED_FILES=("db/password.txt" "db/enc_key.txt" "backend/secrets/jwt.txt")

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "[!] Error: Missing secret file: ./$file"
        exit 1
    fi
done
echo "[+] All secrets found."

# ==========================================
# 2. SAST: Code & Config Scan (Trivy)
# ==========================================
echo "[*] Starting SAST: Scanning filesystem..."

docker run --rm -v $PWD:/src aquasec/trivy fs /src \
  --scanners vuln,secret,config \
  --skip-dirs backend/node_modules,frontend/node_modules \
  --skip-files nginx/ssl/selfsigned.key \
  --severity CRITICAL,HIGH \
  --ignore-unfixed \
  --exit-code 1 

echo "[+] SAST Passed."

# ==========================================
# 3. BUILD & START APPLICATION
# ==========================================
echo "[*] Starting Application Stack..."
docker-compose up -d --build

# ==========================================
# 4. WAIT FOR SERVICES (Robust Loop)
# ==========================================
echo "[*] Waiting for Nginx to respond on HTTPS..."

# We try 20 times (approx 100 seconds)
RETRIES=20
URL="https://localhost:443"

until curl --silent --insecure --output /dev/null --fail "$URL"; do
  ((RETRIES--))
  if [ $RETRIES -le 0 ]; then
    echo ""
    echo "[!] Timeout: Nginx did not respond at $URL after 100 seconds."
    echo "    Check docker logs with: docker-compose logs nginx"
    docker-compose down
    exit 1
  fi
  printf "."
  sleep 5
done

echo ""
echo "[+] App is fully up and running!"

# ==========================================
# 5. DAST: Live Attack (OWASP ZAP)
# ==========================================
echo "[*] Starting DAST: Attacking https://nginx:443..."

# Detect Network
FOLDER_NAME=${PWD##*/}
NETWORK_NAME=$(docker network ls --filter name="${FOLDER_NAME}_public" -q)

if [ -z "$NETWORK_NAME" ]; then
    # Fallback if detection fails
    NETWORK_NAME="${FOLDER_NAME}_public"
fi

docker run --rm \
  --network "$NETWORK_NAME" \
  -v $(pwd):/zap/wrk/:rw \
  ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t https://nginx:443 \
  -r zap_report.html \
  -I \
  -z "-config replacer.full_list\(0\).description=IgnoreSelfSigned -config replacer.full_list\(0\).enabled=true -config replacer.full_list\(0\).matchtype=REQ_HEADER -config replacer.full_list\(0\).matchstr=User-Agent -config replacer.full_list\(0\).regex=false -config replacer.full_list\(0\).replacement=ZAP_Scanner"

# ==========================================
# 6. CLEANUP
# ==========================================
echo "[*] Scanning Complete. Report saved to zap_report.html"
docker-compose down