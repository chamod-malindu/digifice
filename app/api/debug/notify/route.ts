import { NextResponse } from "next/server";
import connectToDB from "@/lib/db";
import Notification from "@/models/Notification";
import Medical from "@/models/Medical";
import User from "@/models/User";

export async function GET() {
    try {
        await connectToDB();

        const notifications = await Notification.find().sort({ createdAt: -1 }).limit(5);
        const medicals = await Medical.find().sort({ createdAt: -1 }).limit(5);

        // Also fetch the user details for the IDs found in notifications
        const userIds = notifications.map(n => n.userId);
        const users = await User.find({ _id: { $in: userIds } }).select('name email role');

        return NextResponse.json({
            recentNotifications: notifications,
            recentMedicals: medicals,
            relatedUsers: users
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
