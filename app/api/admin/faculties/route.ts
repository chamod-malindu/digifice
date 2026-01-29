
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Faculty from '@/models/Faculty';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all faculties (can be used for management list if hierarchy API isn't enough)
export async function GET(request: Request) {
    await connectToDB();
    const faculties = await Faculty.find({}).sort({ name: 1 });
    return NextResponse.json(faculties);
}

// POST new faculty
export async function POST(request: Request) {
    try {
        await connectToDB();
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name } = await request.json();
        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        const faculty = await Faculty.create({ name });
        return NextResponse.json(faculty, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE faculty
export async function DELETE(request: Request) {
    try {
        await connectToDB();
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        await Faculty.findByIdAndDelete(id);
        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT (Update) faculty
export async function PUT(request: Request) {
    try {
        await connectToDB();
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, name } = await request.json();
        if (!id || !name) return NextResponse.json({ error: "ID and Name are required" }, { status: 400 });

        const faculty = await Faculty.findByIdAndUpdate(id, { name }, { new: true });
        return NextResponse.json(faculty);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
