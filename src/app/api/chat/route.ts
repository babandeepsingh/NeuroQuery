// /app/api/chat/route.ts (or /pages/api/chat.ts if using pages directory)
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.POSTGRES_DB_URL,
});

export async function GET(req: NextRequest) {
    const userId = req.url.split('?userId=')[1];  // Example: /api/chat?userId=<user_id>
    let client;
    try {

        client = await pool.connect(); // get a client from the pool

        const query = `
                SELECT * FROM chats
                WHERE user_id = $1
                ORDER BY created_at ASC;
                `;
        const values = [userId];
        const result = await client.query(query, values);

        return NextResponse.json({ chats: result.rows });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (client) {
            client.release(); // release connection back to the pool
        }
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { userId, message, sender } = body;  // message, sender (user/bot)
    let client;
    try {

        client = await pool.connect(); // get a client from the pool

        const query = `
        INSERT INTO chats (user_id, message, sender)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
        const values = [userId, message, sender];

        const result = await client.query(query, values);

        return NextResponse.json({ message: result.rows[0] });
    } catch (error) {
        console.error('Error saving chat message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (client) {
            client.release(); // release connection back to the pool
        }
    }
}

