import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { authenticate, requireAdmin } from '@/lib/middleware';
import { hashPassword } from '@/lib/auth';
import { CreateUserRequest } from '@/types/auth';

// GET - Get all users (Admin only)
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

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role');
        const isActive = searchParams.get('isActive');

        // Build query
        const query: any = {};
        if (role) query.role = role;
        if (isActive !== null && isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        // Get users
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

        return NextResponse.json(
            {
                success: true,
                data: users,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch users',
            },
            { status: 500 }
        );
    }
}

// POST - Create new user (Admin only)
export async function POST(request: NextRequest) {
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

        const body: CreateUserRequest = await request.json();
        const { name, email, role, password, phone } = body;

        // Validate required fields
        if (!name || !email || !role || !password || !phone) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'All fields are required',
                },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'User with this email already exists',
                },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            role,
            password: hashedPassword,
            phone,
        });

        // Return user without password
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        return NextResponse.json(
            {
                success: true,
                data: userResponse,
                message: 'User created successfully',
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Create user error:', error);

        // Handle mongoose validation errors
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
                error: 'Failed to create user',
            },
            { status: 500 }
        );
    }
}
