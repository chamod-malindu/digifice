import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Module from '@/models/Module';

export async function GET() {
    await dbConnect();
    try {
        const modules = await Module.find({}).populate({
            path: 'degreeProgram',
            populate: {
                path: 'department',
                populate: { path: 'faculty' }
            }
        });
        return NextResponse.json(modules);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await dbConnect();
    const data = await req.json();
    try {
        const mod = await Module.create(data);
        return NextResponse.json(mod);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
