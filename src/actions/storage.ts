"use server";

import { storage, BUCKET_NAME, ensureBucketExists } from "@/lib/storage";

export async function getUploadUrlAction(filename: string) {
    try {
        await ensureBucketExists();
        const objectKey = `uploads/${Date.now()}-${filename}`;
        // Expiry 5 minutes
        const url = await storage.presignedPutObject(BUCKET_NAME, objectKey, 60 * 5);
        return { success: true, url, objectKey };
    } catch (e) {
        console.error("Presign Put Error:", e);
        return { success: false, error: "Failed to generate upload URL" };
    }
}

export async function getMediaListAction() {
    try {
        await ensureBucketExists();
        const objects: any[] = [];
        const stream = storage.listObjectsV2(BUCKET_NAME, 'uploads/', true);

        return new Promise<{ success: boolean, data: any[] }>((resolve, reject) => {
            stream.on('data', (obj) => objects.push(obj));
            stream.on('end', () => resolve({ success: true, data: objects }));
            stream.on('error', (err) => resolve({ success: false, data: [] })); // Don't crash
        });
    } catch (e) {
        return { success: false, data: [] };
    }
}

export async function getViewUrlAction(objectKey: string) {
    try {
        const url = await storage.presignedGetObject(BUCKET_NAME, objectKey, 60 * 60); // 1 hr
        return { success: true, url };
    } catch (e) {
        return { success: false, error: "Failed to get view URL" };
    }
}
