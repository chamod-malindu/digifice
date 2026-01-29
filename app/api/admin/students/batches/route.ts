import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectToDB from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        await connectToDB();
        const session = await getServerSession(authOptions);

        if (!session || !session.user || session.user.role !== 'admin') {
            // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Aggregate to get distinct batches with counts and last created date
        const batches = await User.aggregate([
            { $match: { bulkUploadBatch: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: "$bulkUploadBatch",
                    count: { $sum: 1 },
                    createdAt: { $max: "$createdAt" }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        return NextResponse.json(batches);
    } catch (error) {
        console.error("Failed to fetch batches:", error);
        return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
    }
}
