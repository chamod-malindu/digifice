
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables immediately
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function cleanup() {
    try {
        const { default: connectToDB } = await import("@/lib/db");
        const { default: Result } = await import("@/models/Result");
        const { default: User } = await import("@/models/User");

        console.log("Connecting to database...");
        await connectToDB();

        console.log("Fetching all results...");
        const results = await Result.find({});
        console.log(`Found ${results.length} results.`);

        let deletedCount = 0;

        for (const result of results) {
            if (!result.studentId) {
                console.log(`Result ${result._id} has no studentId. Deleting...`);
                await Result.findByIdAndDelete(result._id);
                deletedCount++;
                continue;
            }

            // Check if student exists
            const student = await User.findById(result.studentId);
            if (!student) {
                console.log(`Result ${result._id} has invalid studentId ${result.studentId}. Deleting...`);
                await Result.findByIdAndDelete(result._id);
                deletedCount++;
            }
        }

        console.log(`Cleanup complete! Deleted ${deletedCount} invalid results.`);
        process.exit(0);
    } catch (error) {
        console.error("Cleanup failed:", error);
        process.exit(1);
    }
}

cleanup();
