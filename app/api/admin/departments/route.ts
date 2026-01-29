
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Department from '@/models/Department';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        await connectToDB();
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, facultyId } = await request.json();
        if (!name || !facultyId) return NextResponse.json({ error: "Name and Faculty ID are required" }, { status: 400 });

        const dept = await Department.create({ name, faculty: facultyId });
        return NextResponse.json(dept, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

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

        await Department.findByIdAndDelete(id);
        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await connectToDB();
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, name } = await request.json();
        if (!id || !name) return NextResponse.json({ error: "ID and Name are required" }, { status: 400 });

        const dept = await Department.findByIdAndUpdate(id, { name }, { new: true });
        return NextResponse.json(dept);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
