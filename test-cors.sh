#!/bin/bash
# CORS Troubleshooting Script
# Run this to check if CORS is properly configured on your backend

BACKEND_URL="https://nool-backend-v3rd.onrender.com"
FRONTEND_URL="https://nool-rouge.vercel.app"

echo "=== CORS Preflight Test ==="
echo "Backend: $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo ""

# Send an OPTIONS (preflight) request
echo "Sending preflight request to /api/auth/login..."
echo ""

curl -i -X OPTIONS \
  "$BACKEND_URL/api/auth/login" \
  -H "Origin: $FRONTEND_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization" \
  -H "Sec-Fetch-Mode: cors" \
  -H "Sec-Fetch-Site: cross-site"

echo ""
echo ""
echo "=== What to look for ==="
echo "✅ HTTP 200 or 204 (NOT 403, 401, 405)"
echo "✅ access-control-allow-origin: $FRONTEND_URL"
echo "✅ access-control-allow-methods: includes POST"
echo "✅ access-control-allow-credentials: true"
echo "✅ access-control-allow-headers: includes *"
echo ""
