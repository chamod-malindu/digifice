
import { NextResponse } from 'next/server';
import connectToDB from '@/lib/db';
import Module from '@/models/Module';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        await connectToDB();
        const { searchParams } = new URL(request.url);
        const degreeId = searchParams.get('degreeId');

        const query: any = {};
        if (degreeId) {
            query.degreeProgram = degreeId;
        }

        const modules = await Module.find(query)
            .populate('degreeProgram', 'name')
            .sort({ code: 1 });

        return NextResponse.json(modules);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDB();
        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, code, credits, semester, degreeId } = body;

        if (!name || !code || !credits || !semester || !degreeId) {
            return NextResponse.json({ error: "All fields (name, code, credits, semester, degreeId) are required" }, { status: 400 });
        }

        const module = await Module.create({
            name,
            code,
            credits,
            semester,
            degreeProgram: degreeId
        });
        return NextResponse.json(module, { status: 201 });
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

        await Module.findByIdAndDelete(id);
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

        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

        const module = await Module.findByIdAndUpdate(id, updates, { new: true });
        return NextResponse.json(module);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
