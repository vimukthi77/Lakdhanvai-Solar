import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authenticate, requireAdmin } from '@/lib/middleware';
import { hashPassword } from '@/lib/auth';
import { UpdateUserRequest } from '@/types/auth';

// GET - Get single user by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const user = await User.findById(params.id).select('-password');

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'User not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: user,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch user',
            },
            { status: 500 }
        );
    }
}

// PUT - Update user
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const body: UpdateUserRequest & { password?: string } = await request.json();
        const updateData: any = {};

        // Only update provided fields
        if (body.name) updateData.name = body.name;
        if (body.email) updateData.email = body.email.toLowerCase();
        if (body.role) updateData.role = body.role;
        if (body.phone) updateData.phone = body.phone;
        if (body.isActive !== undefined) updateData.isActive = body.isActive;

        // Hash password if provided
        if (body.password) {
            updateData.password = await hashPassword(body.password);
        }

        const user = await User.findByIdAndUpdate(params.id, updateData, {
            new: true,
            runValidators: true,
        }).select('-password');

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'User not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: user,
                message: 'User updated successfully',
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Update user error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(
                (err: any) => err.message
            );
            return NextResponse.json(
                {
                    success: false,
                    error: messages.join(', '),
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update user',
            },
            { status: 500 }
        );
    }
}

// DELETE - Delete user
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const user = await User.findByIdAndDelete(params.id);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'User not found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'User deleted successfully',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete user',
            },
            { status: 500 }
        );
    }
}
