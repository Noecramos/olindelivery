"use client";

import RaspadinhaValidator from "../../components/admin/RaspadinhaValidator";

export default function RaspadinhaAdmin() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Validador Independente</h1>
            <RaspadinhaValidator />
        </div>
    );
}
