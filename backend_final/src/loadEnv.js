import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');

try {
    if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
        // console.log(`✅ Loaded ${Object.keys(envConfig).length} variables from .env`);
    } else {
        console.error(`❌ .env file not found at: ${envPath}`);
    }
} catch (err) {
    console.error('❌ Error parsing .env file:', err.message);
}
