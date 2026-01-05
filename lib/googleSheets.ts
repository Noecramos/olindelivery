import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

if (!SHEET_ID || !SERVICE_EMAIL || !PRIVATE_KEY) {
    console.error("Missing Google Sheets Credentials");
}

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
];

const jwt = new JWT({
    email: SERVICE_EMAIL,
    key: PRIVATE_KEY ? PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '') : undefined,
    scopes: SCOPES,
});

export const doc = new GoogleSpreadsheet(SHEET_ID as string, jwt);

let isLoaded = false;

export async function loadDoc() {
    if (!isLoaded) {
        await doc.loadInfo();
        isLoaded = true;
    }
    return doc;
}

export async function getSheetByTitle(title: string) {
    await loadDoc();
    let sheet = doc.sheetsByTitle[title];
    if (!sheet) {
        // Auto-create sheet if missing (Self-healing)
        sheet = await doc.addSheet({ title });
    }

    // Always ensure headers are set if they are missing
    const headers = getHeadersForSheet(title);
    if (headers) {
        const currentHeaders = await sheet.loadHeaderRow().then(() => sheet.headerValues).catch(() => []);
        if (currentHeaders.length === 0) {
            await sheet.setHeaderRow(headers);
        }
    }
    return sheet;
}

function getHeadersForSheet(title: string) {
    switch (title) {
        case 'Restaurants': return ['id', 'slug', 'name', 'password', 'isOpen', 'image', 'banner', 'approved', 'phone', 'address', 'deliveryTime', 'instagram', 'zipCode', 'hours', 'responsibleName', 'email', 'whatsapp', 'type'];
        case 'Categories': return ['id', 'restaurantId', 'description'];
        case 'Products': return ['id', 'restaurantId', 'categoryId', 'name', 'description', 'price', 'image', 'available'];
        case 'Orders': return ['id', 'ticketNumber', 'restaurantId', 'status', 'total', 'customerName', 'customerPhone', 'customerAddress', 'paymentMethod', 'changeFor', 'items', 'createdAt'];
        case 'GlobalSettings': return ['key', 'value'];
        default: return null;
    }
}

