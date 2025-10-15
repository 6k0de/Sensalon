export const ROLE_IDS = {
    DISTRIBUTOR: '542c2e4e-7177-11ef-a9b1-0050563b',
    SALON: '542c325b-7177-11ef-a9b1-0050563b',
    USER: '8337416f-7177-11ef-a9b1-0050563b',
} as const;

export type UserType = 'distributor' | 'salon' | 'user' | 'unknown';

export function getUserTypeFromRoleId(roleId?: string | null): UserType {
    switch (roleId) {
        case ROLE_IDS.DISTRIBUTOR: return 'distributor';
        case ROLE_IDS.SALON: return 'salon';
        case ROLE_IDS.USER: return 'user';
        default: return 'unknown';
    }
}
