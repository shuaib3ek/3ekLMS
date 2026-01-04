import { Client } from 'minio';

// Initialize MinIO Client
// In dev, we use localhost. In prod, env vars.
export const storage = new Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

export const BUCKET_NAME = process.env.MINIO_BUCKET || '3ek-lms-assets';

export async function ensureBucketExists() {
    try {
        const docUrl = `http://localhost:9000/minio/health/live`; // Simple check

        const exists = await storage.bucketExists(BUCKET_NAME);
        if (!exists) {
            await storage.makeBucket(BUCKET_NAME, 'us-east-1');
            console.log(`✅ Bucket '${BUCKET_NAME}' created.`);

            // Set public policy for simpler MVP testing? 
            // Or keep private and use Presigned URLs (Better for Enterprise).
            // Let's keep it private.
        }
    } catch (e) {
        console.error("Storage Init Error:", e);
    }
}
