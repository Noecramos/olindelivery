#!/bin/bash
# Quick deployment script for ZAPPY rebranding

echo "🚀 ZAPPY Deployment Script"
echo "=========================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    exit 1
fi

echo "📋 Step 1: Checking git status..."
git status

echo ""
echo "📦 Step 2: Adding all changes..."
git add .

echo ""
echo "💬 Step 3: Committing changes..."
git commit -m "Complete ZAPPY rebranding - Phase 2

- Updated all branding from OlinDelivery to ZAPPY
- Standardized footer: © 2026 Noviapp Mobile Apps • ZAPPY®
- Updated header to ZAPPY landscape image (256px)
- Added animated splash screen with gold background
- Updated 21 files across the project
- All admin pages, user pages, and emails rebranded
- Maintained backward compatibility with existing URLs"

echo ""
echo "🚀 Step 4: Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📊 Next steps:"
echo "1. Check Vercel deployment: https://vercel.com/noe-ramos-projects/olindelivery"
echo "2. Wait for deployment to complete (~2-3 minutes)"
echo "3. Verify at: https://olindelivery.vercel.app/"
echo "4. Update database via Super Admin panel"
echo ""
echo "📖 See DEPLOYMENT_CHECKLIST.md for full details"
