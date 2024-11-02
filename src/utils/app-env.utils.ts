import * as fs from 'node:fs';
import dotenv from 'dotenv';

export default class AppEnvUtils {
    public init(): void {
        // Set the NODE_ENV to 'local' by default
        process.env.NODE_ENV = process.env.NODE_ENV || 'local';

        const envFound =
            process.env.NODE_ENV && fs.existsSync('.env.' + process.env.NODE_ENV)
                ? dotenv.config({path: ['.env.' + process.env.NODE_ENV, '.env']})
                : dotenv.config({path: '.env'});
        if (envFound.error) {
            // This error should crash whole process
            throw new Error("⚠️  Couldn't find .env file  ⚠️");
        }
    }
}
