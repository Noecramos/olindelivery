#!/usr/bin/env node

console.log('🚀 OlinDelivery - Quick Setup Check\n');

const fs = require('fs');
const path = require('path');

// Check 1: Dependencies
console.log('📦 Checking dependencies...');
try {
    require.resolve('google-spreadsheet');
    require.resolve('google-auth-library');
    console.log('✅ Google Sheets packages installed\n');
} catch (e) {
    console.log('❌ Missing packages. Run: npm install google-spreadsheet google-auth-library\n');
}

// Check 2: Environment file
console.log('🔐 Checking environment variables...');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasSheetId = envContent.includes('GOOGLE_SHEET_ID=');
    const hasEmail = envContent.includes('GOOGLE_SERVICE_ACCOUNT_EMAIL=');
    const hasKey = envContent.includes('GOOGLE_PRIVATE_KEY=');

    if (hasSheetId && hasEmail && hasKey) {
        console.log('✅ .env.local file exists with all required variables\n');
    } else {
        console.log('⚠️  .env.local exists but missing some variables');
        if (!hasSheetId) console.log('   - Missing GOOGLE_SHEET_ID');
        if (!hasEmail) console.log('   - Missing GOOGLE_SERVICE_ACCOUNT_EMAIL');
        if (!hasKey) console.log('   - Missing GOOGLE_PRIVATE_KEY');
        console.log('');
    }
} else {
    console.log('❌ .env.local file not found');
    console.log('   Create it using env.template as reference\n');
}

// Check 3: Required files
console.log('📄 Checking integration files...');
const requiredFiles = [
    'lib/googleSheets.ts',
    'app/api/orders/route.ts'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING!`);
        allFilesExist = false;
    }
});

console.log('\n📋 Summary:');
console.log('Read SETUP_INSTRUCTIONS.md for detailed setup steps');
console.log('Read PROJECT_STATUS.md for current project status');
console.log('\n🔗 Your Google Sheet:');
console.log('https://docs.google.com/spreadsheets/d/1e-ontpHhCbPUz9e2dw0l0lF4OfGX71vqOxsc6G9q814/edit');
console.log('\n👤 Service Account Email:');
console.log('olindelivery-sheets@olindelivery-481922.iam.gserviceaccount.com');
console.log('\n💡 Remember to:');
console.log('1. Share your Google Sheet with the service account email');
console.log('2. Add column headers to the sheet (see SHEET_STRUCTURE.md)');
console.log('3. Run: npm run dev\n');
