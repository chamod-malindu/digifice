import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Result from '@/models/Result';
import User from '@/models/User';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const studentId = searchParams.get('studentId');

        const query: any = {};
        if (studentId) {
            query.studentId = studentId;
        }

        // If searching, we might need to look up users first or use aggregate
        // For simplicity, let's populate and filter in memory if result set is small, 
        // or assume search is for Module Name for now.
        if (search) {
            query.$or = [
                { moduleName: { $regex: search, $options: 'i' } },
                { moduleCode: { $regex: search, $options: 'i' } },
            ];
        }

        const results = await Result.find(query)
            .populate('studentId', 'name email image')
            .sort({ createdAt: -1 });

        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        // Basic validation
        if (!body.studentId || !body.moduleName || !body.marks) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const result = await Result.create(body);
        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create result' }, { status: 500 });
    }
}
