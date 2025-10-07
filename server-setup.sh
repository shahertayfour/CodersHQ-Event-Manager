#!/bin/bash
# CHQ Space Management - Server Setup Script
# Run this on your Linux server (192.168.1.84)

set -e  # Exit on error

echo "======================================="
echo "CHQ Space Management - Server Setup"
echo "======================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if Docker is installed
echo -e "${YELLOW}Step 1: Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# Step 2: Check if Docker Compose is installed
echo -e "${YELLOW}Step 2: Checking Docker Compose installation...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Installing Docker Compose...${NC}"
    sudo apt update
    sudo apt install docker-compose -y
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi

# Step 3: Install Cloudflared
echo -e "${YELLOW}Step 3: Installing Cloudflared...${NC}"
if ! command -v cloudflared &> /dev/null; then
    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared.deb
    rm cloudflared.deb
    echo -e "${GREEN}✓ Cloudflared installed${NC}"
else
    echo -e "${GREEN}✓ Cloudflared already installed${NC}"
fi

# Step 4: Clone or update repository
echo -e "${YELLOW}Step 4: Setting up repository...${NC}"
if [ -d "$HOME/CodersHQ-Event-Manager" ]; then
    echo "Repository exists, updating..."
    cd ~/CodersHQ-Event-Manager
    git pull
else
    echo "Cloning repository..."
    cd ~
    git clone https://github.com/shahertayfour/CodersHQ-Event-Manager.git
    cd CodersHQ-Event-Manager
fi
echo -e "${GREEN}✓ Repository ready${NC}"

# Step 5: Configure environment
echo -e "${YELLOW}Step 5: Configuring environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env file with your configuration:${NC}"
    echo "  - JWT_SECRET (generate a strong random string)"
    echo "  - ADMIN_PASSWORD (set a secure password)"
    echo "  - FRONTEND_URL=https://dashboard.codershq.ae"
    echo ""
    read -p "Press Enter to edit .env file..."
    nano .env
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Step 6: Start Docker containers
echo -e "${YELLOW}Step 6: Starting Docker containers...${NC}"
docker-compose down 2>/dev/null || true
docker-compose up -d --build
echo -e "${GREEN}✓ Docker containers started${NC}"

# Wait for backend to be ready
echo "Waiting for backend to start..."
sleep 10

# Check if containers are running
docker-compose ps

# Step 7: Setup Cloudflare Tunnel
echo ""
echo -e "${YELLOW}Step 7: Setting up Cloudflare Tunnel...${NC}"
echo ""
echo "Next steps:"
echo "1. Login to Cloudflare:"
echo "   cloudflared tunnel login"
echo ""
echo "2. Create tunnel:"
echo "   cloudflared tunnel create chq-backend"
echo ""
echo "3. Note the Tunnel ID from the output"
echo ""
echo "4. Create tunnel config:"
echo "   mkdir -p ~/.cloudflared"
echo "   nano ~/.cloudflared/config.yml"
echo ""
echo "5. Add this configuration (replace <TUNNEL_ID> and <CREDENTIALS_PATH>):"
echo "   tunnel: <YOUR_TUNNEL_ID>"
echo "   credentials-file: /home/n8n/.cloudflared/<YOUR_TUNNEL_ID>.json"
echo "   ingress:"
echo "     - hostname: api.dashboard.codershq.ae"
echo "       service: http://localhost:4000"
echo "     - service: http_status:404"
echo ""
echo "6. Route DNS:"
echo "   cloudflared tunnel route dns chq-backend api.dashboard.codershq.ae"
echo ""
echo "7. Install as service:"
echo "   sudo cloudflared service install"
echo "   sudo systemctl start cloudflared"
echo "   sudo systemctl enable cloudflared"
echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Your application is running at:"
echo "  - Backend: http://localhost:4000"
echo "  - Frontend: http://localhost:80"
echo ""
echo "After setting up Cloudflare Tunnel:"
echo "  - API: https://api.dashboard.codershq.ae"
echo ""
