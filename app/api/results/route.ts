import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Result from '@/models/Result';

export async function POST(req: Request) {
    await dbConnect();
    const data = await req.json();
    try {
        const res = await Result.create(data);
        return NextResponse.json(res);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

export async function GET(req: Request) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get('moduleId');
    let query = {};
    if (moduleId) {
        // Find module code from module ID? Or pass query? 
        // Or simpler: fetch all if no filter. 
        // For now basic find.
    }
    const results = await Result.find(query).populate('studentId', 'name email');
    return NextResponse.json(results);
}
