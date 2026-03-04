import { UserRole } from '@/lib/constants';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    phone: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface LoginSession {
    _id: string;
    userId: string;
    userEmail: string;
    userName: string;
    userRole: string;
    loginTime: string;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
}

export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalLogins: number;
    recentLogins: number;
    usersByRole: {
        role: string;
        count: number;
    }[];
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    role: UserRole;
    password: string;
    phone: string;
}

export interface UpdateUserRequest {
    name?: string;
    email?: string;
    role?: UserRole;
    phone?: string;
    isActive?: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
    };
    token: string;
}
