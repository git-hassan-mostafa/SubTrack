import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import type { JwtPayloadShape } from '../../common/strategies/jwt.strategy';
import { PrismaTenantRepository } from '../infrastructure/prisma-tenant.repository';
import { PrismaUserRepository } from '../infrastructure/prisma-user.repository';

@Injectable()
export class AuthApplicationService {
  constructor(
    private readonly users: PrismaUserRepository,
    private readonly tenants: PrismaTenantRepository,
    private readonly jwt: JwtService,
  ) {}

  async register(companyName: string, email: string, password: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const tenant = await this.tenants.create({ companyName });
    const user = await this.users.create({
      tenantId: tenant.id,
      email,
      passwordHash,
      role: UserRole.TENANT_ADMIN,
    });
    return this.buildTokenResponse(user.id, user.tenantId, user.role);
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.buildTokenResponse(user.id, user.tenantId, user.role);
  }

  private buildTokenResponse(userId: string, tenantId: string, role: UserRole) {
    const payload: JwtPayloadShape = {
      sub: userId,
      tenantId,
      role,
    };
    const accessToken = this.jwt.sign(payload);
    return {
      accessToken,
      user: { userId, tenantId, role },
    };
  }
}
