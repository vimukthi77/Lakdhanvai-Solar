import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './auth';
import { UserRole } from '@/lib/constants';

export interface AuthenticatedRequest extends NextRequest {
    user?: JWTPayload;
}

/**
 * Middleware to authenticate requests using JWT
 */
export async function authenticate(
    request: NextRequest
): Promise<{ user: JWTPayload } | NextResponse> {
    try {
        // Get token from cookie
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized - No token provided' },
                { status: 401 }
            );
        }

        // Verify token
        const payload = verifyToken(token);

        if (!payload) {
            return NextResponse.json(
                { error: 'Unauthorized - Invalid token' },
                { status: 401 }
            );
        }

        return { user: payload };
    } catch (error) {
        console.error('Authentication error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 401 }
        );
    }
}

/**
 * Middleware to check if user has required role(s)
 */
export function requireRole(
    user: JWTPayload,
    allowedRoles: UserRole[]
): NextResponse | null {
    if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
            { error: 'Forbidden - Insufficient permissions' },
            { status: 403 }
        );
    }
    return null;
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(user: JWTPayload): NextResponse | null {
    return requireRole(user, [UserRole.ADMIN]);
}
