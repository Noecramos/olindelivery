import { sql } from '@vercel/postgres';

export async function query(queryString: TemplateStringsArray, ...values: any[]) {
    try {
        return await sql(queryString, ...values);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch data from database.');
    }
}

export { sql };
