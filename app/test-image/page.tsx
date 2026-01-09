"use client";

import { useState } from "react";

export default function TestImagePage() {
    const [imageUrl, setImageUrl] = useState("/uploads/1767992525915-amazon.jpg");
    const [testResult, setTestResult] = useState("");

    const testImage = () => {
        const img = new Image();
        img.onload = () => {
            setTestResult(`✅ Image loaded successfully! Size: ${img.width}x${img.height}`);
        };
        img.onerror = () => {
            setTestResult(`❌ Failed to load image from: ${imageUrl}`);
        };
        img.src = imageUrl;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-6">🖼️ Test Image Loading</h1>

                <div className="space-y-6">
                    <div>
                        <label className="block font-bold mb-2">Image URL:</label>
                        <input
                            type="text"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            placeholder="/uploads/filename.jpg"
                        />
                    </div>

                    <button
                        onClick={testImage}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700"
                    >
                        Test Image
                    </button>

                    {testResult && (
                        <div className={`p-4 rounded-lg ${testResult.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {testResult}
                        </div>
                    )}

                    <div className="border-t pt-6">
                        <h2 className="font-bold mb-4">Preview:</h2>
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <img
                                src={imageUrl}
                                alt="Test"
                                className="max-w-full h-auto rounded-lg"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext fill='%23999' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage Not Found%3C/text%3E%3C/svg%3E";
                                }}
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-bold mb-2">📋 Quick Tests:</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setImageUrl("/uploads/1767992525915-amazon.jpg")}
                                className="block w-full text-left p-2 hover:bg-blue-100 rounded"
                            >
                                Test: /uploads/1767992525915-amazon.jpg
                            </button>
                            <button
                                onClick={() => setImageUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80")}
                                className="block w-full text-left p-2 hover:bg-blue-100 rounded"
                            >
                                Test: External URL (Unsplash)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
