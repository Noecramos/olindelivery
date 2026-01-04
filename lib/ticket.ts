import { getSheetByTitle } from '@/lib/googleSheets';

export async function generateTicketNumber(restaurantId: string): Promise<string> {
    const sheet = await getSheetByTitle('Orders');
    const rows = await sheet.getRows();

    // Filter orders for this specific restaurant
    const restaurantOrders = rows.filter((r: any) => r.get('restaurantId') === restaurantId);

    // Find absolute max ticket number (assuming simple integer increment)
    // We can prefix it with restaurant code if needed, but keeping it simple integer for now
    // Or if the user wants "FOODBOOK" style, maybe "FB-1001"?
    // Let's stick to simple sequential per store: 1001, 1002...

    let maxTicket = 1000;

    restaurantOrders.forEach((r: any) => {
        const t = parseInt(r.get('ticketNumber'));
        if (!isNaN(t) && t > maxTicket) {
            maxTicket = t;
        }
    });

    return (maxTicket + 1).toString();
}
