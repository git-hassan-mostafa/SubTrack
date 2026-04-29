import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '@subtrack/shared';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.TENANT_ADMIN)
  create(@CurrentUser() user: any, @Body() createUserDto: CreateUserDto) {
    return this.userService.create(user.tenantId, createUserDto);
  }

  @Get()
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  findAll(@CurrentUser() user: any) {
    return this.userService.findAll(user.tenantId);
  }

  @Get(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.userService.findById(id, user.tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.TENANT_ADMIN)
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, user.tenantId, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.TENANT_ADMIN)
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.userService.delete(id, user.tenantId);
  }
}
