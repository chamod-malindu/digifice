import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Result from '@/models/Result';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const result = await Result.findById(id).populate('studentId', 'name email');

        if (!result) {
            return NextResponse.json({ error: 'Result not found' }, { status: 404 });
        }
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch result' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        // Basic validation could go here

        const updatedResult = await Result.findByIdAndUpdate(id, body, { new: true }).populate('studentId', 'name email');

        if (!updatedResult) {
            return NextResponse.json({ error: 'Result not found' }, { status: 404 });
        }

        return NextResponse.json(updatedResult);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update result' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const { id } = await params;
        const deletedResult = await Result.findByIdAndDelete(id);

        if (!deletedResult) {
            return NextResponse.json({ error: 'Result not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Result deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete result' }, { status: 500 });
    }
}
