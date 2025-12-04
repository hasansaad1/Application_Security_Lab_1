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
# 2.5. DEPENDENCY VULNERABILITY SCANNING
# ==========================================
echo "[*] Starting Dependency Vulnerability Scan..."

# Create reports directory
mkdir -p scan-reports

# Function to scan npm dependencies using Docker (more reliable)
scan_npm_dependencies() {
    local dir=$1
    local name=$2
    
    echo "[*] Scanning $name dependencies..."
    
    if [ ! -f "$dir/package.json" ]; then
        echo "[!] Warning: No package.json found in $dir, skipping..."
        return
    fi
    
    # Use Docker to run npm commands (ensures npm is available)
    echo "[*] Running npm audit for $name (using Docker)..."
    
    # Run npm audit inside a Node.js container
    docker run --rm \
      -v "$(pwd)/$dir:/app" \
      -w /app \
      node:20-alpine \
      sh -c "
        npm audit --audit-level=moderate --json > /tmp/audit.json 2>&1 || echo '{\"error\":\"npm audit failed\"}' > /tmp/audit.json
        npm audit --audit-level=moderate > /tmp/audit.txt 2>&1 || echo 'npm audit command failed' > /tmp/audit.txt
        npm outdated --json > /tmp/outdated.json 2>&1 || echo '{}' > /tmp/outdated.json
        cat /tmp/audit.json
      " > "scan-reports/${name}_npm_audit.json" 2>&1
    
    docker run --rm \
      -v "$(pwd)/$dir:/app" \
      -w /app \
      node:20-alpine \
      sh -c "
        npm audit --audit-level=moderate > /tmp/audit.txt 2>&1 || echo 'npm audit command failed. Check if package-lock.json exists.' > /tmp/audit.txt
        cat /tmp/audit.txt
      " > "scan-reports/${name}_npm_audit.txt" 2>&1
    
    docker run --rm \
      -v "$(pwd)/$dir:/app" \
      -w /app \
      node:20-alpine \
      sh -c "
        npm outdated --json > /tmp/outdated.json 2>&1 || echo '{}' > /tmp/outdated.json
        cat /tmp/outdated.json
      " > "scan-reports/${name}_outdated.json" 2>&1
    
    # Check if files were created and have content
    if [ ! -s "scan-reports/${name}_npm_audit.json" ]; then
        echo "[!] Warning: npm audit JSON output is empty for $name"
        echo "{\"metadata\":{\"vulnerabilities\":{\"total\":0}},\"message\":\"No vulnerabilities found or npm audit unavailable\"}" > "scan-reports/${name}_npm_audit.json"
    fi
    
    if [ ! -s "scan-reports/${name}_npm_audit.txt" ]; then
        echo "[!] Warning: npm audit text output is empty for $name"
        echo "No vulnerabilities found or npm audit command failed." > "scan-reports/${name}_npm_audit.txt"
    fi
    
    if [ ! -s "scan-reports/${name}_outdated.json" ]; then
        echo "{}" > "scan-reports/${name}_outdated.json"
    fi
    
    # Check if there are vulnerabilities
    if [ -f "scan-reports/${name}_npm_audit.json" ] && [ -s "scan-reports/${name}_npm_audit.json" ]; then
        # Try to extract vulnerability count from JSON using jq if available, or grep
        if command -v jq > /dev/null 2>&1; then
            VULN_COUNT=$(jq -r '.metadata.vulnerabilities.total // 0' "scan-reports/${name}_npm_audit.json" 2>/dev/null || echo "0")
        else
            # Fallback to grep parsing
            VULN_COUNT=$(grep -o '"total":[0-9]*' "scan-reports/${name}_npm_audit.json" | head -1 | grep -o '[0-9]*' || echo "0")
            # Also try alternative JSON structure
            if [ "$VULN_COUNT" = "0" ] || [ -z "$VULN_COUNT" ]; then
                VULN_COUNT=$(grep -oE '"vulnerabilities":\s*\{[^}]*"total":\s*[0-9]+' "scan-reports/${name}_npm_audit.json" | grep -oE '[0-9]+' | head -1 || echo "0")
            fi
        fi
        
        # Check for error messages
        if grep -q '"error"' "scan-reports/${name}_npm_audit.json" 2>/dev/null; then
            echo "[!] npm audit encountered an error for $name"
            echo "    Check scan-reports/${name}_npm_audit.json for details"
        elif [ "$VULN_COUNT" != "0" ] && [ ! -z "$VULN_COUNT" ] && [ "$VULN_COUNT" != "null" ]; then
            echo "[!] Found $VULN_COUNT vulnerabilities in $name dependencies"
            echo "    Check scan-reports/${name}_npm_audit.txt for details"
            echo "    Run 'npm audit fix' in $dir/ to attempt automatic fixes"
        else
            echo "[+] No moderate+ severity vulnerabilities found in $name dependencies"
        fi
    fi
}

# Scan backend dependencies
scan_npm_dependencies "backend" "backend"

# Scan frontend dependencies
scan_npm_dependencies "frontend" "frontend"

# Use Trivy to scan node_modules for known vulnerabilities
echo "[*] Scanning node_modules with Trivy for known CVEs..."

# Scan backend node_modules
if [ -d "backend/node_modules" ]; then
    echo "[*] Scanning backend/node_modules with Trivy..."
    docker run --rm -v $PWD:/src aquasec/trivy fs /src/backend/node_modules \
      --scanners vuln \
      --severity CRITICAL,HIGH \
      --format json \
      --output scan-reports/backend_trivy_deps.json \
      --exit-code 0 2>&1 || echo '{"Results":[]}' > scan-reports/backend_trivy_deps.json
    
    docker run --rm -v $PWD:/src aquasec/trivy fs /src/backend/node_modules \
      --scanners vuln \
      --severity CRITICAL,HIGH \
      --format table \
      --output scan-reports/backend_trivy_deps.txt \
      --exit-code 0 2>&1 || echo "No vulnerabilities found or scan failed" > scan-reports/backend_trivy_deps.txt
    
    # Check if file is empty and add a message
    if [ ! -s "scan-reports/backend_trivy_deps.txt" ]; then
        echo "No CRITICAL or HIGH severity vulnerabilities found in backend dependencies." > scan-reports/backend_trivy_deps.txt
    fi
else
    echo "[!] Warning: backend/node_modules not found, skipping Trivy scan"
    echo "No backend node_modules directory found. Run 'npm install' in backend/ first." > scan-reports/backend_trivy_deps.txt
    echo '{"Results":[]}' > scan-reports/backend_trivy_deps.json
fi

# Scan frontend node_modules
if [ -d "frontend/node_modules" ]; then
    echo "[*] Scanning frontend/node_modules with Trivy..."
    docker run --rm -v $PWD:/src aquasec/trivy fs /src/frontend/node_modules \
      --scanners vuln \
      --severity CRITICAL,HIGH \
      --format json \
      --output scan-reports/frontend_trivy_deps.json \
      --exit-code 0 2>&1 || echo '{"Results":[]}' > scan-reports/frontend_trivy_deps.json
    
    docker run --rm -v $PWD:/src aquasec/trivy fs /src/frontend/node_modules \
      --scanners vuln \
      --severity CRITICAL,HIGH \
      --format table \
      --output scan-reports/frontend_trivy_deps.txt \
      --exit-code 0 2>&1 || echo "No vulnerabilities found or scan failed" > scan-reports/frontend_trivy_deps.txt
    
    # Check if file is empty and add a message
    if [ ! -s "scan-reports/frontend_trivy_deps.txt" ]; then
        echo "No CRITICAL or HIGH severity vulnerabilities found in frontend dependencies." > scan-reports/frontend_trivy_deps.txt
    fi
else
    echo "[!] Warning: frontend/node_modules not found, skipping Trivy scan"
    echo "No frontend node_modules directory found. Run 'npm install' in frontend/ first." > scan-reports/frontend_trivy_deps.txt
    echo '{"Results":[]}' > scan-reports/frontend_trivy_deps.json
fi

# Generate summary report
echo "[*] Generating dependency security summary..."
cat > scan-reports/dependency_security_summary.txt << 'EOF'
==========================================
DEPENDENCY SECURITY SCAN SUMMARY
==========================================

This report contains:
1. npm audit results (vulnerabilities in dependencies)
2. Trivy scans of node_modules (CVE database)
3. Outdated packages that may have security fixes

RECOMMENDATIONS:
- Review *_npm_audit.txt files for detailed vulnerability information
- Check *_outdated.json files for packages with available updates
- Run 'npm audit fix' in backend/ or frontend/ to attempt automatic fixes
- For packages with security vulnerabilities, update to patched versions
- Review Trivy CVE reports for known security issues in dependencies

EOF

echo "" >> scan-reports/dependency_security_summary.txt
echo "Backend Dependencies:" >> scan-reports/dependency_security_summary.txt
echo "---------------------" >> scan-reports/dependency_security_summary.txt
if [ -f "scan-reports/backend_npm_audit.txt" ] && [ -s "scan-reports/backend_npm_audit.txt" ]; then
    head -50 scan-reports/backend_npm_audit.txt >> scan-reports/dependency_security_summary.txt
else
    echo "No npm audit data available. Ensure package-lock.json exists and npm is accessible." >> scan-reports/dependency_security_summary.txt
fi

echo "" >> scan-reports/dependency_security_summary.txt
echo "Frontend Dependencies:" >> scan-reports/dependency_security_summary.txt
echo "----------------------" >> scan-reports/dependency_security_summary.txt
if [ -f "scan-reports/frontend_npm_audit.txt" ] && [ -s "scan-reports/frontend_npm_audit.txt" ]; then
    head -50 scan-reports/frontend_npm_audit.txt >> scan-reports/dependency_security_summary.txt
else
    echo "No npm audit data available. Ensure package-lock.json exists and npm is accessible." >> scan-reports/dependency_security_summary.txt
fi

echo "" >> scan-reports/dependency_security_summary.txt
echo "Trivy CVE Scan Results:" >> scan-reports/dependency_security_summary.txt
echo "-----------------------" >> scan-reports/dependency_security_summary.txt
if [ -f "scan-reports/backend_trivy_deps.txt" ] && [ -s "scan-reports/backend_trivy_deps.txt" ]; then
    echo "Backend:" >> scan-reports/dependency_security_summary.txt
    head -30 scan-reports/backend_trivy_deps.txt >> scan-reports/dependency_security_summary.txt
else
    echo "Backend: No Trivy scan data available." >> scan-reports/dependency_security_summary.txt
fi

if [ -f "scan-reports/frontend_trivy_deps.txt" ] && [ -s "scan-reports/frontend_trivy_deps.txt" ]; then
    echo "" >> scan-reports/dependency_security_summary.txt
    echo "Frontend:" >> scan-reports/dependency_security_summary.txt
    head -30 scan-reports/frontend_trivy_deps.txt >> scan-reports/dependency_security_summary.txt
else
    echo "" >> scan-reports/dependency_security_summary.txt
    echo "Frontend: No Trivy scan data available." >> scan-reports/dependency_security_summary.txt
fi

# Add package version information
echo "" >> scan-reports/dependency_security_summary.txt
echo "Package Versions Summary:" >> scan-reports/dependency_security_summary.txt
echo "------------------------" >> scan-reports/dependency_security_summary.txt
if [ -f "backend/package.json" ]; then
    echo "Backend packages:" >> scan-reports/dependency_security_summary.txt
    grep -E '"(bcrypt|express|jsonwebtoken|helmet|cors|multer|mysql2)"' backend/package.json | head -10 >> scan-reports/dependency_security_summary.txt || echo "  (package.json parsing failed)" >> scan-reports/dependency_security_summary.txt
fi
if [ -f "frontend/package.json" ]; then
    echo "" >> scan-reports/dependency_security_summary.txt
    echo "Frontend packages:" >> scan-reports/dependency_security_summary.txt
    grep -E '"(next|react|react-dom|zod)"' frontend/package.json | head -10 >> scan-reports/dependency_security_summary.txt || echo "  (package.json parsing failed)" >> scan-reports/dependency_security_summary.txt
fi

echo ""
echo "[+] Dependency scan complete. Reports saved to scan-reports/"
echo "    - dependency_security_summary.txt (quick overview)"
echo "    - *_npm_audit.txt (detailed npm audit results)"
echo "    - *_trivy_deps.txt (CVE scan results)"
echo "    - *_outdated.json (packages with available updates)"

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

# Detect Network - Most reliable method: inspect the nginx container
echo "[*] Detecting Docker network for DAST scan..."

NGINX_CONTAINER=$(docker ps --filter "name=nginx" --format "{{.Names}}" | head -1)

if [ -z "$NGINX_CONTAINER" ]; then
    echo "[!] Error: nginx container not found. Is the application running?"
    echo "    Run: docker-compose ps"
    docker-compose down
    exit 1
fi

echo "[*] Found nginx container: $NGINX_CONTAINER"

# Get all networks the nginx container is connected to
ALL_NETWORKS=$(docker inspect "$NGINX_CONTAINER" --format '{{range $net, $conf := .NetworkSettings.Networks}}{{$net}} {{end}}')

# Find the network with "public" in the name (Docker Compose network naming)
NETWORK_NAME=$(echo "$ALL_NETWORKS" | tr ' ' '\n' | grep -i "public" | head -1)

# If no "public" network found, use the first network (usually the main one)
if [ -z "$NETWORK_NAME" ]; then
    NETWORK_NAME=$(echo "$ALL_NETWORKS" | tr ' ' '\n' | grep -v "^$" | head -1)
    echo "[!] Warning: No 'public' network found, using first available: $NETWORK_NAME"
else
    echo "[*] Detected network: $NETWORK_NAME"
fi

# Verify network exists
if [ -z "$NETWORK_NAME" ] || ! docker network inspect "$NETWORK_NAME" > /dev/null 2>&1; then
    echo "[!] Error: Network '$NETWORK_NAME' does not exist or is invalid"
    echo "[*] Available networks:"
    docker network ls --format "  - {{.Name}}"
    echo ""
    echo "[*] Networks connected to nginx:"
    echo "$ALL_NETWORKS" | tr ' ' '\n' | grep -v "^$" | sed 's/^/  - /'
    echo ""
    echo "[!] Cannot proceed with DAST scan"
    docker-compose down
    exit 1
fi

echo "[*] Using Docker network: $NETWORK_NAME"

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
echo "[*] Scanning Complete."
echo ""
echo "Reports generated:"
echo "  - zap_report.html (DAST scan results)"
echo "  - scan-reports/dependency_security_summary.txt (dependency vulnerabilities)"
echo "  - scan-reports/*_npm_audit.txt (npm audit details)"
echo "  - scan-reports/*_trivy_deps.txt (CVE scan details)"
echo ""
docker-compose down