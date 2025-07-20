// app/api/hello/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


export async function GET() {
    return NextResponse.json({
        message: 'Hello from static API!',
    });
}



export async function POST(req: NextRequest) {
    console.log("post:received")
    const body = await req.json();
    console.log("post:body",body)

    const userMessage = body.message;
    console.log("post:userMessage",userMessage)


    if (!userMessage) {
        console.log("post:failed nomessgae")

        return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    try {
        const schemaDefinition = `
            Tables:
            - users(id, name, email, created_at)
            - orders(id, user_id, total_amount, status, created_at)
            - products(id, name, price, stock)
            - order_items(id, order_id, product_id, quantity)
            
            Use only the above tables and columns. Return only the SQL query without any explanations.
        `;
        const prompt = `
            You are an AI that converts English questions into SQL queries using a given database schema.

            Schema:
            ${schemaDefinition}

             Return the result as valid Markdown format that includes:

            - The SQL query in a \`\`\`sql\` block
            - A section titled "Tables Used" listing the tables and how they are used, using - and **bold text** for table names
            - Wrap the whole result in Markdown headers like ## SQL Query, ## Tables Used

            User Request: "${userMessage}"

             Respond only with Markdown, nothing else.

            SQL Query:
        `;

        console.log("post:sending prompt and schema", prompt)


        const chatResponse = await openai.chat.completions.create({
            // model: 'gpt-4',
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0,
        });
        console.log("post:chatResponse", chatResponse)


        const aiResponse = chatResponse.choices[0].message.content;
        console.log("post:aiResponse", aiResponse)


        return NextResponse.json({ message: aiResponse });
    } catch (error: any) {
        console.error('Error in POST /api/hello:', error);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}