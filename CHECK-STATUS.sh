#!/bin/bash
# Quick Status Check Script
# Run this to diagnose issues quickly

echo "======================================"
echo "CHQ Space Management - Status Check"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Docker Containers
echo -e "${YELLOW}1. Docker Containers:${NC}"
docker ps --filter "name=chq" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo -e "${RED}✗ Docker not running${NC}"
echo ""

# 2. Backend - Local
echo -e "${YELLOW}2. Backend (Local - http://localhost:4000/api):${NC}"
BACKEND_LOCAL=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api 2>/dev/null)
if [ "$BACKEND_LOCAL" = "401" ]; then
    echo -e "${GREEN}✓ Running (HTTP $BACKEND_LOCAL)${NC}"
else
    echo -e "${RED}✗ Not responding (HTTP $BACKEND_LOCAL)${NC}"
fi
echo ""

# 3. Backend - Tunnel
echo -e "${YELLOW}3. Backend via Tunnel (https://api-dashboard.codershq.ae/api):${NC}"
BACKEND_TUNNEL=$(curl -s -o /dev/null -w "%{http_code}" https://api-dashboard.codershq.ae/api 2>/dev/null)
if [ "$BACKEND_TUNNEL" = "401" ]; then
    echo -e "${GREEN}✓ Accessible (HTTP $BACKEND_TUNNEL)${NC}"
else
    echo -e "${RED}✗ Not accessible (HTTP $BACKEND_TUNNEL)${NC}"
    echo -e "${YELLOW}  → Check Cloudflare Tunnel is running${NC}"
fi
echo ""

# 4. Cloudflare Tunnel
echo -e "${YELLOW}4. Cloudflare Tunnel:${NC}"
if systemctl is-active --quiet cloudflared 2>/dev/null; then
    echo -e "${GREEN}✓ Running as service${NC}"
elif pgrep -f "cloudflared tunnel" > /dev/null; then
    echo -e "${GREEN}✓ Running in terminal${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo -e "${YELLOW}  → Start with: sudo systemctl start cloudflared${NC}"
    echo -e "${YELLOW}  → OR: cloudflared tunnel run chq-backend${NC}"
fi
echo ""

# 5. Frontend Config
echo -e "${YELLOW}5. Frontend Config (https://dashboard.codershq.ae):${NC}"
FRONTEND_CONFIG=$(curl -s https://dashboard.codershq.ae/js/config.js 2>/dev/null | grep -o "api-dashboard.codershq.ae")
if [ ! -z "$FRONTEND_CONFIG" ]; then
    echo -e "${GREEN}✓ Correct API URL (api-dashboard.codershq.ae)${NC}"
else
    FRONTEND_CONFIG_OLD=$(curl -s https://dashboard.codershq.ae/js/config.js 2>/dev/null | grep -o "api.dashboard.codershq.ae")
    if [ ! -z "$FRONTEND_CONFIG_OLD" ]; then
        echo -e "${RED}✗ OLD API URL (api.dashboard.codershq.ae)${NC}"
        echo -e "${YELLOW}  → Need to redeploy frontend with updated config${NC}"
    else
        echo -e "${RED}✗ Cannot fetch config${NC}"
    fi
fi
echo ""

# 6. DNS Check
echo -e "${YELLOW}6. DNS Resolution:${NC}"
DNS_CHECK=$(nslookup api-dashboard.codershq.ae 2>/dev/null | grep -i "address" | tail -1)
if [ ! -z "$DNS_CHECK" ]; then
    echo -e "${GREEN}✓ DNS resolves: $DNS_CHECK${NC}"
else
    echo -e "${RED}✗ DNS not resolving${NC}"
fi
echo ""

# 7. Test Login
echo -e "${YELLOW}7. Test Login API:${NC}"
LOGIN_TEST=$(curl -s -X POST https://api-dashboard.codershq.ae/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@codershq.ae","password":"Admin@123456"}' 2>/dev/null)

if echo "$LOGIN_TEST" | grep -q "access_token"; then
    echo -e "${GREEN}✓ Login works (password: Admin@123456)${NC}"
elif echo "$LOGIN_TEST" | grep -q "Invalid credentials"; then
    echo -e "${YELLOW}⚠ API works but password wrong${NC}"
    echo -e "${YELLOW}  → Check .env file for ADMIN_PASSWORD${NC}"
else
    echo -e "${RED}✗ Login API not responding${NC}"
    echo "  Response: $LOGIN_TEST"
fi
echo ""

# Summary
echo "======================================"
echo -e "${YELLOW}Summary & Next Steps:${NC}"
echo "======================================"

# Check if everything is OK
ALL_OK=true

if [ "$BACKEND_LOCAL" != "401" ]; then
    echo -e "${RED}→ Start backend: docker compose up -d${NC}"
    ALL_OK=false
fi

if [ "$BACKEND_TUNNEL" != "401" ]; then
    echo -e "${RED}→ Start tunnel: sudo systemctl start cloudflared${NC}"
    ALL_OK=false
fi

if [ -z "$FRONTEND_CONFIG" ]; then
    echo -e "${RED}→ Redeploy frontend: cd frontend-html && npx wrangler pages deploy .${NC}"
    ALL_OK=false
fi

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}✓ Everything looks good!${NC}"
    echo ""
    echo "Login at: https://dashboard.codershq.ae"
    echo "Email: admin@codershq.ae"
    echo "Password: Check .env file (default: Admin@123456)"
fi

echo ""
