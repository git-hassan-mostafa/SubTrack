import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { UserRepository, UserWithPassword } from '../domain/user.repository';
import { User } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user;
  }

  async findByEmailWithPassword(email: string): Promise<UserWithPassword | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return { ...user, passwordHash: user.passwordHash };
  }

  async findAll(tenantId: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({ where: { tenantId } });
    return users;
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
    return user;
  }

  async update(
    id: string,
    data: Partial<Omit<User, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      },
    });
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }
}
