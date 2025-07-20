import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

// Create a single pool instance (reuse across requests)
const pool = new Pool({
    connectionString: process.env.POSTGRES_DB_URL,
});

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { fullName, id, email, user } = body;
    console.log("post:userMessage", fullName, id, email);

    let client;

    try {
        client = await pool.connect(); // get a client from the pool



        let res = client.query("select * from users")

        console.log(res, "User:::")

        // const query = `
        //   INSERT INTO users (id, email, username, account)
        //   VALUES ($1, $2, $3, $4)
        //   ON CONFLICT (id) DO NOTHING
        //   RETURNING *;
        // `;

        const query = `
            WITH inserted AS (
                INSERT INTO users (id, email, username, account)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (id) DO NOTHING
                RETURNING *
            )
            SELECT * FROM inserted
            UNION
            SELECT * FROM users WHERE id = $1
            LIMIT 1;
            `;


        console.log("post:userMessage", fullName, id, email, user);

        const values = [id, email, fullName, user];

        const result = await client.query(query, values);

        return NextResponse.json({ user: result.rows[0] || null });
    } catch (error) {
        console.error("Error inserting user:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    } finally {
        if (client) {
            client.release(); // release connection back to the pool
        }
    }
}
