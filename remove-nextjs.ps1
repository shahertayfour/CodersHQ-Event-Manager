# Script to remove Next.js frontend and keep only vanilla HTML version

Write-Host "Removing Next.js frontend..." -ForegroundColor Yellow
Write-Host ""

# Kill all node processes
Write-Host "Stopping Node.js processes..." -ForegroundColor Cyan
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Remove frontend directory
Write-Host "Removing frontend directory..." -ForegroundColor Cyan
try {
    Remove-Item -Path "frontend" -Recurse -Force -ErrorAction Stop
    Write-Host "✅ Successfully removed frontend directory" -ForegroundColor Green
} catch {
    Write-Host "❌ Could not remove frontend directory" -ForegroundColor Red
    Write-Host "Please close any applications using files in the frontend folder" -ForegroundColor Yellow
    Write-Host "Then run this script again" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Committing changes to Git..." -ForegroundColor Cyan
git add -A
git commit -m "Remove Next.js frontend - using vanilla HTML version only"
git push origin main

Write-Host ""
Write-Host "✅ Done! Next.js frontend removed." -ForegroundColor Green
Write-Host "Only frontend-html remains (vanilla HTML/CSS/JS version)" -ForegroundColor Green
