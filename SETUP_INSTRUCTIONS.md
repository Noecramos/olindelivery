# OlinDelivery - Google Sheets Integration Setup

## ⚠️ IMPORTANT: Complete These Steps

### 1. Install Required Packages
Open a terminal in the project folder and run:
```bash
npm install google-spreadsheet google-auth-library
```

### 2. Find Your JSON Key File
The file should be in your Downloads folder with a name like:
- `olindelivery-481922-2a3f3d53101e.json`
- `olindelivery-481922-f21cdbfddaf4.json`
- `olindelivery-481922-1b2df7829694.json`

**If you can't find it:**
1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=olindelivery-481922
2. Click on `olindelivery-sheets@olindelivery-481922.iam.gserviceaccount.com`
3. Go to the **KEYS** tab
4. Click **ADD KEY** → **Create new key**
5. Choose **JSON** and click **CREATE**
6. The file will download - note where it saves!

### 3. Create .env.local File
Once you have the JSON file:

1. Open the JSON file with Notepad
2. Find these two values:
   - `"client_email"`: Copy the email address
   - `"private_key"`: Copy the ENTIRE private key (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

3. Create a file named `.env.local` in the project root with this content:

```env
GOOGLE_SHEET_ID=1e-ontpHhCbPUz9e2dw0l0lF4OfGX71vqOxsc6G9q814
GOOGLE_SERVICE_ACCOUNT_EMAIL=paste-the-client_email-here
GOOGLE_PRIVATE_KEY="paste-the-entire-private_key-here"
```

**IMPORTANT:** The private key must be wrapped in quotes and keep all the `\n` characters!

### 4. Set Up Google Sheet Headers
Open your Google Sheet: https://docs.google.com/spreadsheets/d/1e-ontpHhCbPUz9e2dw0l0lF4OfGX71vqOxsc6G9q814/edit

In the **first row**, add these column headers (exactly as shown):
```
id | createdAt | status | customerName | customerPhone | customerAddress | total | items
```

### 5. Share the Sheet with Service Account
1. In your Google Sheet, click **Share** (top right)
2. Paste this email: `olindelivery-sheets@olindelivery-481922.iam.gserviceaccount.com`
3. Give it **Editor** access
4. Click **Done**

### 6. Run the Development Server
```bash
npm run dev
```

### 7. Test the Integration
1. Go to http://localhost:3000
2. Add items to cart
3. Go to checkout
4. Fill in your details
5. Complete the order
6. Check your Google Sheet - a new row should appear!
7. Check the admin panel at http://localhost:3000/admin (password: admin)

---

## Troubleshooting

### Error: "Missing Google Sheets Credentials"
- Make sure `.env.local` exists in the project root
- Verify all three environment variables are set
- Restart the dev server after creating `.env.local`

### Error: "No permission"
- Make sure you shared the sheet with the service account email
- The service account needs **Editor** access

### Error: "Cannot find module 'google-spreadsheet'"
- Run `npm install` to install dependencies

---

## What's Been Done

✅ Created `lib/googleSheets.ts` - Helper to connect to Google Sheets
✅ Updated `app/api/orders/route.ts` - API now uses Sheets instead of JSON file
✅ Created service account in Google Cloud
✅ Generated JSON keys (need to be added to .env.local)

## What You Need to Do

1. ⬜ Install npm packages
2. ⬜ Find/download JSON key file
3. ⬜ Create `.env.local` with credentials
4. ⬜ Add column headers to Google Sheet
5. ⬜ Share sheet with service account
6. ⬜ Test the integration
