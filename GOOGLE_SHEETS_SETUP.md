# Google Sheets Configuration for OlinDelivery
# =============================================

## Step 1: Get Your Service Account Email
Your service account email is: olindelivery-sheets@olindelivery-481922.iam.gserviceaccount.com

## Step 2: Share Your Google Sheet
1. Open: https://docs.google.com/spreadsheets/d/1e-ontpHhCbPUz9e2dw0l0lF4OfGX71vqOxsc6G9q814/edit
2. Click the "Share" button (top right)
3. Paste this email: olindelivery-sheets@olindelivery-481922.iam.gserviceaccount.com
4. Give it "Editor" access
5. Click "Done"

## Step 3: Find Your Downloaded JSON Key
The JSON key file should be one of these:
- olindelivery-481922-2a3f3d53101e.json
- olindelivery-481922-f21cdbfddaf4.json
- olindelivery-481922-1b2df7829694.json

Look in:
- C:\Users\noecr\Downloads
- Your Desktop
- Your browser's download location

## Step 4: Copy the JSON Contents
Once you find the file:
1. Right-click → Open with Notepad
2. Press Ctrl+A (select all)
3. Press Ctrl+C (copy)
4. Paste the contents in the chat

## Step 5: Set Up Environment Variables
I will create the .env.local file for you once you provide the JSON content.

The file will contain:
- GOOGLE_SHEET_ID (already have this)
- GOOGLE_SERVICE_ACCOUNT_EMAIL (already have this)
- GOOGLE_PRIVATE_KEY (need from JSON file)
