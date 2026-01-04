# 🍕 OlinDelivery

A modern delivery PWA built with Next.js, featuring WhatsApp integration and Google Sheets as a database backend.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Google Sheets Integration
```bash
# Run the setup checker
node check-setup.js
```

Follow the instructions in **`SETUP_INSTRUCTIONS.md`** for detailed setup steps.

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📱 Features

- ✅ **Menu & Cart System** - Browse items and add to cart
- ✅ **Checkout Flow** - Customer information and order summary
- ✅ **WhatsApp Integration** - Orders sent via WhatsApp
- ✅ **Google Sheets Backend** - Orders stored in Google Sheets
- ✅ **Admin Dashboard** - View and manage orders at `/admin`
- ✅ **PWA Ready** - Installable on mobile devices
- ⏳ **OX Payments** - Integration pending

## 📂 Project Structure

```
olindelivery/
├── app/
│   ├── page.tsx              # Landing page with menu
│   ├── checkout/             # Checkout page
│   ├── admin/                # Admin dashboard
│   ├── api/orders/           # Orders API (Google Sheets)
│   ├── context/              # React Context (Cart)
│   └── data/                 # Menu items
├── lib/
│   └── googleSheets.ts       # Google Sheets helper
├── public/                   # Static assets
├── SETUP_INSTRUCTIONS.md     # Complete setup guide
├── PROJECT_STATUS.md         # Current project status
├── SHEET_STRUCTURE.md        # Google Sheet structure
└── check-setup.js            # Setup verification script
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with:

```env
GOOGLE_SHEET_ID=your-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

See `env.template` for reference.

### Google Sheet Setup
Your Google Sheet needs these column headers:
```
id | createdAt | status | customerName | customerPhone | customerAddress | total | items
```

See `SHEET_STRUCTURE.md` for details.

## 📖 Documentation

- **[SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md)** - Complete setup guide
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Current project status
- **[SHEET_STRUCTURE.md](./SHEET_STRUCTURE.md)** - Google Sheet structure

## 🔗 Important Links

- **Google Sheet**: [View Sheet](https://docs.google.com/spreadsheets/d/1e-ontpHhCbPUz9e2dw0l0lF4OfGX71vqOxsc6G9q814/edit)
- **Service Account**: `olindelivery-sheets@olindelivery-481922.iam.gserviceaccount.com`
- **Admin Panel**: http://localhost:3000/admin (password: `admin`)

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Google Sheets (via `google-spreadsheet`)
- **Styling**: CSS Modules
- **Authentication**: Google Service Account

## 📝 Next Steps

1. ✅ Complete Google Sheets setup (see SETUP_INSTRUCTIONS.md)
2. ⏳ Integrate OX Payments for real payment processing
3. ⏳ Improve admin authentication (move password to env)
4. ⏳ Add order status updates
5. ⏳ Deploy to production

## 🤝 Contributing

This is a private project. For questions or issues, contact the development team.

## 📄 License

Private - All rights reserved
