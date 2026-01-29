import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/db";
import User from "@/models/User";
import Department from "@/models/Department";
import Faculty from "@/models/Faculty"; // Creating explicit dependency

import Module from "@/models/Module";

export async function GET(req: Request) {
    try {
        await connectToDB();

        // Force model registration to avoid MissingSchemaError
        // These calls ensure that the models are registered in Mongoose
        const _d = Department;
        const _f = Faculty;
        const _m = Module;
        const _u = User;

        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'admin') {
            // Allow lecturers to search too if needed, but primarily admin feature
            // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const departmentId = searchParams.get('departmentId');

        const query: any = { role: 'lecturer' };

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (departmentId) {
            query.department = departmentId;
        }

        // Fetch lecturers (plain JS objects to allow attaching new properties)
        console.log("Fetching lecturers...");
        const lecturers = await User.find(query)
            .select('name email image department')
            .populate({
                path: 'department',
                select: 'name faculty',
                populate: { path: 'faculty', select: 'name' }
            })
            .limit(20)
            .lean();

        console.log(`Found ${lecturers.length} lecturers.`);

        // Fetch modules assigned to these lecturers
        const lecturerIds = lecturers.map((l: any) => l._id);
        console.log("Fetching modules for lecturer IDs:", lecturerIds);

        const modules = await Module.find({ leader: { $in: lecturerIds } }).select('name code leader');
        console.log(`Found ${modules.length} assigned modules.`);

        // Attach modules to respective lecturers
        const lecturersWithModules = lecturers.map((lecturer: any) => {
            const assignedModules = modules.filter((m: any) =>
                m.leader && m.leader.toString() === lecturer._id.toString()
            );
            return { ...lecturer, modules: assignedModules };
        });

        console.log("Returning enriched lecturers data.");
        return NextResponse.json(lecturersWithModules);
    } catch (error) {
        console.error("Failed to fetch lecturers FULL ERROR:", error);
        return NextResponse.json({ error: "Failed to fetch lecturers", details: String(error) }, { status: 500 });
    }
}
