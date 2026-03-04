'use client';

import { useEffect, useState } from 'react';
import { Users, Activity, UserCheck, Clock } from 'lucide-react';

interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalLogins: number;
    recentLogins: number;
    usersByRole: {
        role: string;
        count: number;
    }[];
    recentLoginSessions: {
        _id: string;
        userName: string;
        userEmail: string;
        userRole: string;
        loginTime: string;
        ipAddress?: string;
    }[];
}

interface UserSummary {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    isActive: boolean;
    createdAt: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch dashboard stats
            const statsResponse = await fetch('/api/admin/dashboard/stats');
            const statsData = await statsResponse.json();

            if (statsData.success) {
                setStats(statsData.data);
            }

            // Fetch users summary
            const usersResponse = await fetch('/api/admin/users');
            const usersData = await usersResponse.json();

            if (usersData.success) {
                setUsers(usersData.data.slice(0, 5)); // Get first 5 users
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    const getRoleBadgeColor = (role: string) => {
        const colors: { [key: string]: string } = {
            admin: 'bg-purple-100 text-purple-700',
            supervisor: 'bg-blue-100 text-blue-700',
            safety_officer: 'bg-green-100 text-green-700',
            gate_security: 'bg-yellow-100 text-yellow-700',
            unloading_operator: 'bg-orange-100 text-orange-700',
        };
        return colors[role] || 'bg-gray-100 text-gray-700';
    };

    const formatRoleName = (role: string) => {
        return role
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600">
                    Welcome to your admin dashboard. Here's what's happening today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {stats?.totalUsers || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Active Users */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Users</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {stats?.activeUsers || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <UserCheck className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Total Logins */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Logins</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {stats?.totalLogins || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Activity className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                {/* Recent Logins (24h) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">
                                Logins (24h)
                            </p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {stats?.recentLogins || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Users by Role */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Users by Role
                    </h2>
                    <div className="space-y-3">
                        {stats?.usersByRole.map((item) => (
                            <div
                                key={item.role}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    <div
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                                            item.role
                                        )}`}
                                    >
                                        {formatRoleName(item.role)}
                                    </div>
                                </div>
                                <div className="text-lg font-bold text-gray-900">
                                    {item.count}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Login Sessions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Recent Logins
                    </h2>
                    <div className="space-y-3">
                        {stats?.recentLoginSessions.map((session) => (
                            <div
                                key={session._id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {session.userName}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {session.userEmail}
                                    </p>
                                </div>
                                <div className="text-right ml-4">
                                    <div
                                        className={`px-2 py-1 rounded-full text-xs font-medium mb-1 ${getRoleBadgeColor(
                                            session.userRole
                                        )}`}
                                    >
                                        {formatRoleName(session.userRole)}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {formatDate(session.loginTime)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Users Summary Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
                    <a
                        href="/admin/users"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                        View All →
                    </a>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Name
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Email
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Role
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Phone
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr
                                    key={user._id}
                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                    <td className="py-3 px-4 text-sm text-gray-900">
                                        {user.name}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">
                                        {user.email}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                                                user.role
                                            )}`}
                                        >
                                            {formatRoleName(user.role)}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-600">
                                        {user.phone}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
