# Cloudflare Deployment Script
# Automates deployment of CHQ Space Management to Cloudflare

Write-Host "================================" -ForegroundColor Cyan
Write-Host "CHQ Cloudflare Deployment Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if Wrangler is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
$wrangler = Get-Command wrangler -ErrorAction SilentlyContinue
if (-not $wrangler) {
    Write-Host "❌ Wrangler CLI not found. Installing..." -ForegroundColor Red
    npm install -g wrangler
}

$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflared) {
    Write-Host "❌ Cloudflared not found. Please install it:" -ForegroundColor Red
    Write-Host "   winget install --id Cloudflare.cloudflared" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ All prerequisites found" -ForegroundColor Green
Write-Host ""

# Deploy Frontend
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Step 1: Deploy Frontend to Pages" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$deploy = Read-Host "Deploy frontend to Cloudflare Pages? (y/n)"
if ($deploy -eq 'y') {
    Write-Host "Deploying to Cloudflare Pages..." -ForegroundColor Yellow
    Set-Location "frontend-html"
    npx wrangler pages deploy . --project-name=chq-dashboard
    Set-Location ..
    Write-Host ""
    Write-Host "✅ Frontend deployed!" -ForegroundColor Green
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Go to https://dash.cloudflare.com" -ForegroundColor White
    Write-Host "   2. Workers & Pages → chq-dashboard → Custom domains" -ForegroundColor White
    Write-Host "   3. Add domain: dashboard.codershq.ae" -ForegroundColor White
    Write-Host ""
}

# Cloudflare Tunnel
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Step 2: Cloudflare Tunnel Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$tunnelExists = cloudflared tunnel list 2>$null | Select-String "chq-backend"
if (-not $tunnelExists) {
    Write-Host "Creating Cloudflare Tunnel..." -ForegroundColor Yellow
    cloudflared tunnel create chq-backend
    Write-Host ""
    Write-Host "✅ Tunnel created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Update cloudflared-config.yml with your tunnel ID" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ Tunnel 'chq-backend' already exists" -ForegroundColor Green
}

# Route DNS
$route = Read-Host "Create DNS route for api.dashboard.codershq.ae? (y/n)"
if ($route -eq 'y') {
    Write-Host "Creating DNS route..." -ForegroundColor Yellow
    cloudflared tunnel route dns chq-backend api.dashboard.codershq.ae
    Write-Host "✅ DNS route created!" -ForegroundColor Green
    Write-Host ""
}

# Start Services
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Step 3: Start Services" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$start = Read-Host "Start backend with Docker? (y/n)"
if ($start -eq 'y') {
    Write-Host "Starting Docker containers..." -ForegroundColor Yellow
    docker-compose up -d
    Write-Host ""
    Write-Host "✅ Backend started!" -ForegroundColor Green
    Write-Host ""
    Start-Sleep -Seconds 3
    docker-compose ps
    Write-Host ""
}

$tunnel = Read-Host "Start Cloudflare Tunnel? (y/n)"
if ($tunnel -eq 'y') {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "Starting Cloudflare Tunnel..." -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the tunnel" -ForegroundColor Yellow
    Write-Host ""
    cloudflared tunnel run chq-backend
} else {
    Write-Host ""
    Write-Host "To start the tunnel later, run:" -ForegroundColor Yellow
    Write-Host "   cloudflared tunnel run chq-backend" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your application should be live at:" -ForegroundColor Cyan
Write-Host "   Frontend: https://dashboard.codershq.ae" -ForegroundColor White
Write-Host "   API: https://api.dashboard.codershq.ae" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see: CLOUDFLARE-DEPLOYMENT.md" -ForegroundColor Yellow
Write-Host ""
