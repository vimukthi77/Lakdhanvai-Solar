/**
 * Shared constants for the application
 */

export enum UserRole {
    ADMIN = 'admin',
    SUPERVISOR = 'supervisor',
    SAFETY_OFFICER = 'safety_officer',
    GATE_SECURITY = 'gate_security',
    UNLOADING_OPERATOR = 'unloading_operator',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Admin',
    [UserRole.SUPERVISOR]: 'Supervisor',
    [UserRole.SAFETY_OFFICER]: 'Safety Officer',
    [UserRole.GATE_SECURITY]: 'Gate Security',
    [UserRole.UNLOADING_OPERATOR]: 'Unloading Operator',
};
