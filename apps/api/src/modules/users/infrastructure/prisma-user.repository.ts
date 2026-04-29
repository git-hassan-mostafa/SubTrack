import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { UserRepository, UserWithPassword } from '../domain/user.repository';
import { User, UserRole } from '@subtrack/shared';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(user: any): User {
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.mapToDomain(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.mapToDomain(user) : null;
  }

  async findByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return { ...this.mapToDomain(user), passwordHash: user.passwordHash };
  }

  async findAll(tenantId: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({ where: { tenantId } });
    return users.map((u) => this.mapToDomain(u));
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        tenantId: data.tenantId,
        email: data.email,
        name: data.name,
        role: data.role,
        isActive: data.isActive,
        passwordHash: '',
      },
    });
    return this.mapToDomain(user);
  }

  async update(id: string, data: Partial<Omit<User, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      },
    });
    return this.mapToDomain(user);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }
}
