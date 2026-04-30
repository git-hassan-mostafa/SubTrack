import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CUSTOMER_REPOSITORY, type CustomerRepository } from '../domain/customer.repository';
import { CreateCustomerDto, UpdateCustomerDto } from '../presentation/dto/customer.dto';
import { CustomerStatus, Prisma } from '@prisma/client';

@Injectable()
export class CustomerService {
  constructor(@Inject(CUSTOMER_REPOSITORY) private readonly customerRepo: CustomerRepository) {}

  async findAll(tenantId: string) {
    return this.customerRepo.findAll(tenantId);
  }

  async findById(id: string, tenantId: string) {
    const customer = await this.customerRepo.findById(id, tenantId);
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(tenantId: string, dto: CreateCustomerDto) {
    return this.customerRepo.create({
      tenantId,
      name: dto.name,
      phone: dto.phone,
      address: dto.address,
      latitude: new Prisma.Decimal(dto.latitude ?? 0),
      longitude: new Prisma.Decimal(dto.longitude ?? 0),
      locationAccuracy: new Prisma.Decimal(dto.locationAccuracy ?? 0),
      status: CustomerStatus.ACTIVE,
    });
  }

  async update(id: string, tenantId: string, dto: UpdateCustomerDto) {
    await this.findById(id, tenantId); // checks existence and ownership
    return this.customerRepo.update(id, {
      ...dto,
      latitude: dto.latitude != null ? new Prisma.Decimal(dto.latitude) : undefined,
      longitude: dto.longitude != null ? new Prisma.Decimal(dto.longitude) : undefined,
      locationAccuracy: dto.locationAccuracy != null ? new Prisma.Decimal(dto.locationAccuracy) : undefined,
    });
  }

  async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    return this.customerRepo.updateStatus(id, tenantId, CustomerStatus.INACTIVE); // Soft delete
  }
}
