import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../domain/customer.repository';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { Customer, CustomerStatus } from '@prisma/client';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: string, tenantId: string): Promise<Customer | null> {
    const c = await this.prisma.customer.findFirst({ where: { id, tenantId } });
    return c;
  }

  async findAll(tenantId: string): Promise<Customer[]> {
    const customers = await this.prisma.customer.findMany({ where: { tenantId } });
    return customers;
  }

  async create(
    data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): Promise<Customer> {
    const c = await this.prisma.customer.create({
      data: {
        ...(data.id ? { id: data.id } : {}),
        tenantId: data.tenantId,
        name: data.name,
        phone: data.phone,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        locationAccuracy: data.locationAccuracy,
        status: data.status,
      },
    });
    return c;
  }

  async update(
    id: string,
    data: Partial<Omit<Customer, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Customer> {
    const c = await this.prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        locationAccuracy: data.locationAccuracy,
        status: data.status,
      },
    });
    return c;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.prisma.customer.updateMany({
      where: { id, tenantId },
      data: { status: CustomerStatus.INACTIVE },
    });
  }

  async updateStatus(id: string, tenantId: string, status: CustomerStatus): Promise<Customer> {
    await this.prisma.customer.updateMany({
      where: { id, tenantId },
      data: { status },
    });
    const updated = await this.prisma.customer.findFirst({ where: { id, tenantId } });
    return updated!;
  }
}
