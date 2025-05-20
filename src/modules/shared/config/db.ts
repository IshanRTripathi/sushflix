import mongoose from 'mongoose';
import logger from '../../shared/config/logger';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

interface ProcessEnv {
    MONGODB_URI: string;
}

declare const process: {
    env: ProcessEnv;
    exit: (code?: number) => never;
};

const connectDB = async (): Promise<typeof mongoose> => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }
        
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (err) {
        const error = err as Error;
        logger.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
