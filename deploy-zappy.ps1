# PowerShell deployment script for ZAPPY rebranding

Write-Host "🚀 ZAPPY Deployment Script" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Not in project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Step 1: Checking git status..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "📦 Step 2: Adding all changes..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "💬 Step 3: Committing changes..." -ForegroundColor Yellow
git commit -m "Complete ZAPPY rebranding - Phase 2

- Updated all branding from OlinDelivery to ZAPPY
- Standardized footer: © 2026 Noviapp Mobile Apps • ZAPPY®
- Updated header to ZAPPY landscape image (256px)
- Added animated splash screen with gold background
- Updated 21 files across the project
- All admin pages, user pages, and emails rebranded
- Maintained backward compatibility with existing URLs"

Write-Host ""
Write-Host "🚀 Step 4: Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ Deployment initiated!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Next steps:" -ForegroundColor Cyan
Write-Host "1. Check Vercel deployment: https://vercel.com/noe-ramos-projects/olindelivery"
Write-Host "2. Wait for deployment to complete (~2-3 minutes)"
Write-Host "3. Verify at: https://olindelivery.vercel.app/"
Write-Host "4. Update database via Super Admin panel"
Write-Host ""
Write-Host "📖 See DEPLOYMENT_CHECKLIST.md for full details" -ForegroundColor Cyan
