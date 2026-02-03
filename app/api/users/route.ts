import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const role = searchParams.get('role');

        const query: any = {};
        if (role && role !== 'all') {
            query.role = role;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { name, email, password, role, adminType } = body;

        // Validate input
        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            adminType: role === 'admin' ? adminType : undefined, // Only save adminType if role is admin
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`, // Default avatar
        });

        const { password: _, ...userWithoutPassword } = newUser.toObject();

        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error: any) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
    }
}
