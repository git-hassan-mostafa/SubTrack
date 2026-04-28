import type { UserRole } from '@prisma/client';

export interface RequestUser {
  userId: string;
  tenantId: string;
  role: UserRole;
}
