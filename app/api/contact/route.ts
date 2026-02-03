import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ContactRequest from '@/models/ContactRequest';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { firstName, lastName, email, message } = body;

        if (!firstName || !lastName || !email || !message) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const newRequest = await ContactRequest.create({
            firstName,
            lastName,
            email,
            message,
        });

        return NextResponse.json(newRequest, { status: 201 });
    } catch (error) {
        console.error("Error creating contact request:", error);
        return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        const requests = await ContactRequest.find().sort({ createdAt: -1 });
        return NextResponse.json(requests);
    } catch (error) {
        console.error("Error fetching contact requests:", error);
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }
}
