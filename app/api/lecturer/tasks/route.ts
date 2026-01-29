import { NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import LecturerTask from "@/models/LecturerTask";
import User from "@/models/User";
import Link from "next/link"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req: Request) {
    try {
        await connectToDB();

        const session = await getServerSession(authOptions);
        if (!session || !session.user || session.user.role !== 'lecturer') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const lecturerId = session.user.id;

        const tasks = await LecturerTask.find({ lecturerId }).sort({ date: 1, startTime: 1 });
        return NextResponse.json(tasks);
    } catch (error) {
        console.error("Failed to fetch tasks:", error);
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectToDB();
        const body = await req.json();

        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        body.lecturerId = session.user.id;

        const newTask = await LecturerTask.create(body);
        return NextResponse.json(newTask, { status: 201 });
    } catch (error) {
        console.error("Failed to create task:", error);
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await connectToDB();
        const body = await req.json();
        const { _id, ...updateData } = body;

        if (!_id) {
            console.error("PATCH error: Task ID missing");
            return NextResponse.json({ error: "Task ID required" }, { status: 400 });
        }

        console.log(`Updating task ${_id} with data:`, updateData);

        const updatedTask = await LecturerTask.findByIdAndUpdate(
            _id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            console.error(`PATCH error: Task not found with ID ${_id}`);
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        console.log("Task updated successfully:", updatedTask._id);
        return NextResponse.json(updatedTask);
    } catch (error: any) {
        console.error("Failed to update task:", error.message || error);
        return NextResponse.json({ error: "Failed to update task", details: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await connectToDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "Task ID required" }, { status: 400 });

        await LecturerTask.findByIdAndDelete(id);
        return NextResponse.json({ message: "Task deleted" });
    } catch (error) {
        console.error("Failed to delete task:", error);
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }
}
