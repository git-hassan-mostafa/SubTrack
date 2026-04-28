import type { User, UserRole } from '@prisma/client';

export interface CreateUserInput {
  tenantId: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
}
