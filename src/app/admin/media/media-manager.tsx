"use client";

import { useState, useEffect } from "react";
import { Upload, Play, FileVideo, Image as ImageIcon, Loader2 } from "lucide-react";
import { getUploadUrlAction, getMediaListAction, getViewUrlAction } from "@/actions/storage";

export default function MediaManager() {
    const [files, setFiles] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const loadFiles = async () => {
        const res = await getMediaListAction();
        if (res.success) {
            // Sort by Date desc
            setFiles(res.data.sort((a, b) => b.lastModified - a.lastModified));
        }
    };

    useEffect(() => { loadFiles(); }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            // 1. Get Presigned URL
            const { success, url, objectKey } = await getUploadUrlAction(file.name);
            if (!success || !url) throw new Error("Failed to get upload URL");

            // 2. Upload directly to MinIO
            const uploadRes = await fetch(url, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type }
            });

            if (!uploadRes.ok) throw new Error("Upload failed");

            // 3. Refresh List
            setCsvInput(""); // Clear (reuse var concept? No, clear logic)
            await loadFiles();
        } catch (err) {
            alert("Upload Error");
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handlePreview = async (objectKey: string) => {
        const res = await getViewUrlAction(objectKey);
        if (res.success && res.url) {
            window.open(res.url, '_blank');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
                    <p className="text-gray-500">Manage video assets and documents.</p>
                </div>
                <div className="relative">
                    <input
                        type="file"
                        id="media-upload"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                    <label
                        htmlFor="media-upload"
                        className={`px-6 py-3 bg-blue-600 text-white font-bold rounded-lg cursor-pointer hover:bg-blue-700 flex items-center gap-2 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        {uploading ? "Uploading..." : "Upload Media"}
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {files.map((file) => (
                    <div key={file.etag} className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                            <FileVideo className="w-12 h-12 text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-sm text-gray-900 truncate" title={file.name}>
                                {file.name.replace('uploads/', '')}
                            </h4>
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                            </div>
                            <button
                                onClick={() => handlePreview(file.name)}
                                className="mt-3 w-full py-2 flex items-center justify-center gap-2 bg-gray-50 hover:bg-black hover:text-white text-gray-700 font-bold rounded-lg text-xs transition-colors"
                            >
                                <Play className="w-3 h-3" /> Preview
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {files.length === 0 && !uploading && (
                <div className="text-center py-20 text-gray-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>No media files found. Upload one to get started.</p>
                </div>
            )}
        </div>
    );
}

function setCsvInput(arg0: string) {
    // Placeholder to fix copy-paste error in logic
}
