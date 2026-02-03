
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Load environment variables immediately
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const SEED_ADMINS = [
    {
        name: "Doctor Admin",
        email: "doctor@digifice.com",
        password: "Password@123",
        role: "admin",
        adminType: "medical_officer",
    },
    {
        name: "Exam Admin",
        email: "exam@digifice.com",
        password: "Password@123",
        role: "admin",
        adminType: "exam_admin",
    },
    {
        name: "Super Admin",
        email: "super@digifice.com",
        password: "Password@123",
        role: "admin",
        adminType: "super_admin",
    },
];

async function seed() {
    try {
        // Dynamic imports to ensure env vars are loaded first
        const { default: connectToDB } = await import("@/lib/db");
        const { default: User } = await import("@/models/User");

        console.log("Connecting to database...");
        await connectToDB();

        console.log("Seeding admins...");
        for (const admin of SEED_ADMINS) {
            const existingUser = await User.findOne({ email: admin.email });
            const hashedPassword = await bcrypt.hash(admin.password, 10);

            if (existingUser) {
                console.log(`User ${admin.email} already exists. Updating adminType and password...`);
                existingUser.adminType = admin.adminType;
                existingUser.password = hashedPassword;
                await existingUser.save();
            } else {
                await User.create({
                    ...admin,
                    password: hashedPassword,
                });
                console.log(`Created user ${admin.email}`);
            }
        }

        console.log("Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seed();
