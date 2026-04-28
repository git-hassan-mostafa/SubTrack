import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateUserInput, UserRepositoryPort } from '../domain/user.repository.port';

@Injectable()
export class PrismaUserRepository implements UserRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(data: CreateUserInput): Promise<User> {
    return this.prisma.user.create({ data });
  }
}
