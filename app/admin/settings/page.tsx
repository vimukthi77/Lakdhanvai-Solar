'use client';

import { Settings } from 'lucide-react';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="mt-2 text-gray-600">
                    Configure system settings and preferences
                </p>
            </div>

            {/* Coming Soon Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                        <Settings className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Coming Soon
                    </h2>
                    <p className="text-gray-600 max-w-md">
                        Settings and configuration options will be available here. You'll
                        be able to customize system preferences, notification settings, and
                        more.
                    </p>
                </div>
            </div>
        </div>
    );
}
