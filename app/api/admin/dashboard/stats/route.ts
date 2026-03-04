import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import LoginSession from '@/models/LoginSession';
import { authenticate, requireAdmin } from '@/lib/middleware';

export async function GET(request: NextRequest) {
    try {
        // Authenticate and check admin role
        const authResult = await authenticate(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const roleCheck = requireAdmin(authResult.user);
        if (roleCheck) {
            return roleCheck;
        }

        await connectDB();

        // Get total users
        const totalUsers = await User.countDocuments();

        // Get active users
        const activeUsers = await User.countDocuments({ isActive: true });

        // Get total login sessions
        const totalLogins = await LoginSession.countDocuments();

        // Get recent logins (last 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentLogins = await LoginSession.countDocuments({
            loginTime: { $gte: twentyFourHoursAgo },
        });

        // Get users count by role
        const usersByRole = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    role: '$_id',
                    count: 1,
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);

        // Get recent login sessions (last 10)
        const recentLoginSessions = await LoginSession.find()
            .sort({ loginTime: -1 })
            .limit(10)
            .lean();

        return NextResponse.json(
            {
                success: true,
                data: {
                    totalUsers,
                    activeUsers,
                    totalLogins,
                    recentLogins,
                    usersByRole,
                    recentLoginSessions,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch dashboard statistics',
            },
            { status: 500 }
        );
    }
}
