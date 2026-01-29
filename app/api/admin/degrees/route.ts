
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import DegreeProgram from '@/models/DegreeProgram';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        await connectToDB();
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, departmentId } = await request.json();
        if (!name || !departmentId) return NextResponse.json({ error: "Name and Department ID are required" }, { status: 400 });

        const degree = await DegreeProgram.create({ name, department: departmentId });
        return NextResponse.json(degree, { status: 201 });
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

        await DegreeProgram.findByIdAndDelete(id);
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

        const degree = await DegreeProgram.findByIdAndUpdate(id, { name }, { new: true });
        return NextResponse.json(degree);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
