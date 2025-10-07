# CHQ Space Management Platform - First Time Setup Script
# Run this script only once before starting the application for the first time

Write-Host "🎯 CHQ Space Management Platform - First Time Setup" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host ""

$rootPath = $PSScriptRoot
$backendPath = Join-Path $rootPath "backend"
$frontendPath = Join-Path $rootPath "frontend"

# Step 1: Check PostgreSQL
Write-Host "Step 1: Checking PostgreSQL..." -ForegroundColor Cyan
$pgCheck = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue
if (-not $pgCheck.TcpTestSucceeded) {
    Write-Host "❌ PostgreSQL is not running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install and start PostgreSQL before continuing:" -ForegroundColor Yellow
    Write-Host "Download: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
Write-Host ""

# Step 2: Setup Backend
Write-Host "Step 2: Setting up Backend..." -ForegroundColor Cyan
cd $backendPath

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Backend dependencies already installed" -ForegroundColor Green
}

# Setup .env
if (-not (Test-Path ".env")) {
    Write-Host "Creating backend .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Review backend\.env and update:" -ForegroundColor Yellow
    Write-Host "   - DATABASE_URL (PostgreSQL connection)" -ForegroundColor Yellow
    Write-Host "   - JWT_SECRET (use a secure random string)" -ForegroundColor Yellow
    Write-Host "   - SENDGRID_API_KEY (optional, for emails)" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter when you've updated .env (or press Enter to use defaults for testing)"
}

# Setup database
Write-Host ""
Write-Host "Setting up database..." -ForegroundColor Yellow

Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Running database migrations..." -ForegroundColor Yellow
npm run prisma:migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to run migrations" -ForegroundColor Red
    Write-Host "   Please check your DATABASE_URL in .env" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Seeding database with initial data..." -ForegroundColor Yellow
npm run prisma:seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Seeding failed, but you can continue" -ForegroundColor Yellow
}

Write-Host "✅ Database setup complete" -ForegroundColor Green
Write-Host ""

# Step 3: Setup Frontend
Write-Host "Step 3: Setting up Frontend..." -ForegroundColor Cyan
cd $frontendPath

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Frontend dependencies already installed" -ForegroundColor Green
}

# Setup .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating frontend .env.local file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created .env.local file" -ForegroundColor Green
}
Write-Host ""

# Done
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 What's Next:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the application:" -ForegroundColor White
Write-Host "   Right-click 'start-dev.ps1' → Run with PowerShell" -ForegroundColor Yellow
Write-Host "   OR run manually:" -ForegroundColor Yellow
Write-Host "   - Terminal 1: cd backend && npm run start:dev" -ForegroundColor Yellow
Write-Host "   - Terminal 2: cd frontend && npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Open browser to: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "3. Login as admin:" -ForegroundColor White
Write-Host "   Email:    admin@codershq.ae" -ForegroundColor Yellow
Write-Host "   Password: Admin@123456" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 For more info, see README.md or START.md" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
