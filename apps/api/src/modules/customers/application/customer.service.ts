import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CUSTOMER_REPOSITORY, CustomerRepository } from '../domain/customer.repository';
import { CreateCustomerDto, UpdateCustomerDto } from '../presentation/dto/customer.dto';
import { CustomerStatus } from '@subtrack/shared';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(CUSTOMER_REPOSITORY) private readonly customerRepo: CustomerRepository,
  ) {}

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
      ...dto,
      status: CustomerStatus.ACTIVE,
    });
  }

  async update(id: string, tenantId: string, dto: UpdateCustomerDto) {
    await this.findById(id, tenantId); // checks existence and ownership
    return this.customerRepo.update(id, dto);
  }

  async delete(id: string, tenantId: string) {
    await this.findById(id, tenantId);
    return this.customerRepo.updateStatus(id, tenantId, CustomerStatus.INACTIVE); // Soft delete
  }
}
