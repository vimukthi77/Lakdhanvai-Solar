import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import LoginSession from '@/models/LoginSession';
import {
    comparePassword,
    generateToken,
    getClientIp,
    getUserAgent,
} from '@/lib/auth';
import { LoginRequest } from '@/types/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body: LoginRequest = await request.json();
        const { email, password } = body;

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Check if user is active
        if (!user.isActive) {
            return NextResponse.json(
                { success: false, error: 'Account is deactivated' },
                { status: 403 }
            );
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            name: user.name,
        });

        // Record login session
        const ipAddress = getClientIp(request.headers);
        const userAgent = getUserAgent(request.headers);

        await LoginSession.create({
            userId: user._id,
            userEmail: user.email,
            userName: user.name,
            userRole: user.role,
            loginTime: new Date(),
            ipAddress,
            userAgent,
        });

        // Create response
        const response = NextResponse.json(
            {
                success: true,
                data: {
                    user: {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                    token,
                },
                message: 'Login successful',
            },
            { status: 200 }
        );

        // Set HTTP-only cookie with token
        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'An error occurred during login',
            },
            { status: 500 }
        );
    }
}
