import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { USER_REPOSITORY, type UserRepository } from '../domain/user.repository';
import { CreateUserDto, UpdateUserDto } from '../presentation/dto/user.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService, // Inject for access to advanced PRISMA features not in repo
  ) {}

  async findAll(tenantId: string) {
    return this.userRepository.findAll(tenantId);
  }

  async findById(id: string, tenantId: string) {
    const user = await this.userRepository.findById(id);
    if (!user || user.tenantId !== tenantId) throw new NotFoundException('User not found');
    return user;
  }

  async create(tenantId: string, dto: CreateUserDto) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Bypassing repository to write password
    const createdUser = await this.prisma.user.create({
      data: {
        tenantId,
        email: dto.email,
        name: dto.name,
        role: dto.role,
        passwordHash: hashedPassword,
        isActive: true,
      },
    });

    const { passwordHash, ...result } = createdUser;
    return result;
  }

  async update(id: string, tenantId: string, dto: UpdateUserDto) {
    await this.findById(id, tenantId); // ensure existence and ownership
    return this.userRepository.update(id, dto);
  }

  async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    return this.userRepository.delete(id);
  }
}
