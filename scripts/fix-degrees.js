const mongoose = require('mongoose');

// Define minimal schemas to avoid importing TS files
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    degreeProgram: { type: mongoose.Schema.Types.ObjectId, ref: 'DegreeProgram' },
    role: String
}, { strict: false }); // Allow other fields

const User = mongoose.model('User', userSchema);

(async () => {
    try {
        // Hardcode connection string or read from env if possible, 
        // but since I can't easily read .env.local without dotenv, I'll try to rely on default locahost or ask user?
        // Actually, usually in dev it's localhost:27017 or similar. 
        // Let's try to assume standard mongo URI or read process.env.MONGODB_URI if available (which might not be in this shell).
        // I will try to read the .env.local file first to get the URI.

        console.log("Reading .env.local...");
        const fs = require('fs');
        const path = require('path');
        const envPath = path.join(__dirname, '../.env.local');
        let mongoUri = 'mongodb://localhost:27017/digifice'; // Fallback

        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/MONGODB_URI=(.*)/);
            if (match && match[1]) {
                mongoUri = match[1].trim();
                // Remove quotes if present
                if ((mongoUri.startsWith('"') && mongoUri.endsWith('"')) || (mongoUri.startsWith("'") && mongoUri.endsWith("'"))) {
                    mongoUri = mongoUri.slice(1, -1);
                }
            }
        }

        console.log(`Connecting to DB: ${mongoUri}`);
        await mongoose.connect(mongoUri);
        console.log('Connected to DB');

        // 1. Fix DOFSAT (Food Science) -> Food Science Degree
        const dofsatResult = await User.updateMany(
            {
                department: '69506306b8c81a082f14fed3',
                $or: [{ degreeProgram: { $exists: false } }, { degreeProgram: null }]
            },
            { $set: { degreeProgram: '69506307b8c81a082f14fedf' } }
        );
        console.log(`Updated DOFSAT students: ${dofsatResult.modifiedCount}`);

        // 2. Fix DOEA (Export Agriculture) -> Export Agriculture Degree
        const doeaResult = await User.updateMany(
            {
                department: '69506306b8c81a082f14fed5',
                $or: [{ degreeProgram: { $exists: false } }, { degreeProgram: null }]
            },
            { $set: { degreeProgram: '6982387e46e8ff3fcb2107d0' } }
        );
        console.log(`Updated DOEA students: ${doeaResult.modifiedCount}`);

        // 3. Fix DOCSAT (Computer Science) -> Computer Science Degree
        const docsatResult = await User.updateMany(
            {
                department: '69506307b8c81a082f14fed9',
                $or: [{ degreeProgram: { $exists: false } }, { degreeProgram: null }]
            },
            { $set: { degreeProgram: '69506307b8c81a082f14fee5' } }
        );
        console.log(`Updated DOCSAT students: ${docsatResult.modifiedCount}`);

        // 4. Fix DOMRT (Mineral Resource) -> Mineral Resource Degree
        const domrtResult = await User.updateMany(
            {
                department: '69506307b8c81a082f14fedb',
                $or: [{ degreeProgram: { $exists: false } }, { degreeProgram: null }]
            },
            { $set: { degreeProgram: '69506307b8c81a082f14fee7' } }
        );
        console.log(`Updated DOMRT students: ${domrtResult.modifiedCount}`);

        // 5. Fix DOEAM (Entrepreneurship) -> Entrepreneurship Degree
        const doeamResult = await User.updateMany(
            {
                department: '69506307b8c81a082f14fedd',
                $or: [{ degreeProgram: { $exists: false } }, { degreeProgram: null }]
            },
            { $set: { degreeProgram: '69506307b8c81a082f14fee9' } }
        );
        console.log(`Updated DOEAM students: ${doeamResult.modifiedCount}`);

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
})();
