import { Module } from '@nestjs/common';
import { UserService } from './application/user.service';
import { UsersController } from './presentation/users.controller';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { USER_REPOSITORY } from './domain/user.repository';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    UserService,
  ],
  exports: [UserService, USER_REPOSITORY],
})
export class UsersModule {}
