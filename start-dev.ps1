# CHQ Space Management Platform - Development Startup Script
# This script starts both backend and frontend in separate windows

Write-Host "🚀 Starting CHQ Space Management Platform..." -ForegroundColor Green
Write-Host ""

# Check if PostgreSQL is accessible
Write-Host "Checking PostgreSQL connection..." -ForegroundColor Yellow
$pgCheck = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue
if (-not $pgCheck.TcpTestSucceeded) {
    Write-Host "❌ PostgreSQL is not running on port 5432!" -ForegroundColor Red
    Write-Host "Please start PostgreSQL and try again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
Write-Host ""

# Get the current directory
$rootPath = $PSScriptRoot

# Backend path
$backendPath = Join-Path $rootPath "backend"

# Frontend path
$frontendPath = Join-Path $rootPath "frontend"

# Check if .env exists in backend
if (-not (Test-Path (Join-Path $backendPath ".env"))) {
    Write-Host "⚠️  Backend .env file not found!" -ForegroundColor Yellow
    Write-Host "Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item (Join-Path $backendPath ".env.example") (Join-Path $backendPath ".env")
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host "⚠️  Please update DATABASE_URL and other settings in backend\.env" -ForegroundColor Yellow
    Write-Host ""
}

# Check if .env.local exists in frontend
if (-not (Test-Path (Join-Path $frontendPath ".env.local"))) {
    Write-Host "⚠️  Frontend .env.local file not found!" -ForegroundColor Yellow
    Write-Host "Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item (Join-Path $frontendPath ".env.example") (Join-Path $frontendPath ".env.local")
    Write-Host "✅ Created .env.local file" -ForegroundColor Green
    Write-Host ""
}

# Start Backend in new window
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Cyan
$backendScript = "cd '$backendPath'; Write-Host '🔧 Backend Server' -ForegroundColor Cyan; Write-Host ''; npm run start:dev; Read-Host 'Press Enter to close'"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript

Write-Host "⏳ Waiting for backend to start (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Start Frontend in new window
Write-Host "🎨 Starting Frontend..." -ForegroundColor Cyan
$frontendScript = "cd '$frontendPath'; Write-Host '🎨 Frontend Application' -ForegroundColor Cyan; Write-Host ''; npm run dev; Read-Host 'Press Enter to close'"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript

Write-Host ""
Write-Host "✅ Starting services..." -ForegroundColor Green
Write-Host ""
Write-Host "📝 Application URLs:" -ForegroundColor Cyan
Write-Host "   Frontend:  http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:   http://localhost:4000/api" -ForegroundColor White
Write-Host ""
Write-Host "👤 Admin Credentials:" -ForegroundColor Cyan
Write-Host "   Email:     admin@codershq.ae" -ForegroundColor White
Write-Host "   Password:  Admin@123456" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Wait about 30 seconds for both servers to fully start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to open the application in your browser..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open browser
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "✅ Done! Application should open in your browser." -ForegroundColor Green
Write-Host ""
Write-Host "To stop the servers, close the PowerShell windows or press Ctrl+C in each." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit this window"
