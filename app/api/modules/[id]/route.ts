import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Module from '@/models/Module';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    try {
        const module = await Module.findById(id);
        if (!module) return NextResponse.json({ error: "Module not found" }, { status: 404 });
        return NextResponse.json(module);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    try {
        const body = await req.json();
        const module = await Module.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!module) return NextResponse.json({ error: "Module not found" }, { status: 404 });
        return NextResponse.json(module);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    try {
        const module = await Module.findByIdAndDelete(id);
        if (!module) return NextResponse.json({ error: "Module not found" }, { status: 404 });
        return NextResponse.json({ message: "Module deleted successfully" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
