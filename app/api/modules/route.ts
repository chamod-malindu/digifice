import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Module from '@/models/Module';

export async function GET(req: NextRequest) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const degreeProgramId = searchParams.get('degreeProgram');

    try {
        const query = degreeProgramId ? { degreeProgram: degreeProgramId } : {};
        const modules = await Module.find(query)
            .sort({ createdAt: -1 })
            .populate({
                path: 'degreeProgram',
                populate: {
                    path: 'department',
                    populate: {
                        path: 'faculty'
                    }
                }
            });
        return NextResponse.json(modules);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        const body = await req.json();
        const module = await Module.create(body);
        return NextResponse.json(module, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
