import { User } from '@prisma/client';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export type UserWithPassword = User & { passwordHash: string };

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  /** Returns the user record including the password hash — for auth use only. */
  findByEmailWithPassword(email: string): Promise<UserWithPassword | null>;
  findAll(tenantId: string): Promise<User[]>;
  create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(
    id: string,
    data: Partial<Omit<User, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<User>;
  delete(id: string): Promise<void>;
}
