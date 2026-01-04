import { NextResponse } from 'next/server';
import { getSheetByTitle } from '@/lib/googleSheets';

export async function GET() {
    try {
        const sheet = await getSheetByTitle('Orders');
        const rows = await sheet.getRows();
        let fixedCount = 0;

        for (const row of rows) {
            const pm = row.get('paymentMethod');
            const items = row.get('items');
            const changeFor = row.get('changeFor');

            // Check if paymentMethod looks like the items JSON
            if (typeof pm === 'string' && pm.trim().startsWith('[') && (!items || items === '')) {
                console.log(`Fixing row ${row.rowNumber}...`);

                // Shift data
                const realItems = pm;
                const realCreatedAt = changeFor; // 'changeFor' column held 'createdAt' data

                // Update row
                row.assign({
                    paymentMethod: 'money', // Default fallback
                    changeFor: '',
                    items: realItems,
                    createdAt: realCreatedAt || new Date().toISOString()
                });

                await row.save();
                fixedCount++;
            }
        }

        return NextResponse.json({ success: true, fixed: fixedCount });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
