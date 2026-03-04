import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authenticate } from '@/lib/middleware';

export async function GET(request: NextRequest) {
    try {
        // Authenticate user
        const authResult = await authenticate(request);
        if (authResult instanceof NextResponse) {
            return authResult;
        }

        const { user: authUser } = authResult;

        await connectDB();

        // Get full user details
        const user = await User.findById(authUser.userId).select('-password');

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: {
                    user: {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        phone: user.phone,
                        isActive: user.isActive,
                    },
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get current user error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to get user information',
            },
            { status: 500 }
        );
    }
}
