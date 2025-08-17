import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const initMongoConnection = async () => {
    try {
        const user = process.env.MONGODB_USER;
        const pwd = process.env.MONGODB_PASSWORD;
        const url = process.env.MONGODB_URL;
        const db = process.env.MONGODB_DB;

        console.log(`Connecting to MongoDB database: ${db}...`);

        await mongoose.connect(
            `mongodb+srv://${user}:${pwd}@${url}/${db}?retryWrites=true&w=majority`
        );

        console.log('MongoDB connection successfully established!');
    } catch (err) {
        console.error('Error while setting up MongoDB connection:', err);
        throw err;
    }
};
