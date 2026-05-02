import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../users/domain/user.repository';
import { JwtPayload, LoginResponseDto } from '../../../domain';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<LoginResponseDto> {
    const userWithPassword =
      await this.userRepository.findByEmailWithPassword(email);
    if (!userWithPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userWithPassword.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!userWithPassword.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const payload: JwtPayload = {
      userId: userWithPassword.id,
      tenantId: userWithPassword.tenantId,
      role: userWithPassword.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: userWithPassword.id,
        tenantId: userWithPassword.tenantId,
        email: userWithPassword.email,
        name: userWithPassword.name,
        role: userWithPassword.role,
      },
    };
  }
}
