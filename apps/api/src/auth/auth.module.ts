import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import { AuthApplicationService } from './application/auth.application.service';
import { PrismaTenantRepository } from './infrastructure/prisma-tenant.repository';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { AuthController } from './presentation/auth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN') ?? '7d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    PrismaUserRepository,
    PrismaTenantRepository,
    AuthApplicationService,
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
