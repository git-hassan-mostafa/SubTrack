import { Injectable } from '@nestjs/common';
import { CustomerRepository } from '../domain/customer.repository';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { Customer, CustomerStatus } from '@subtrack/shared';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(c: any): Customer {
    return {
      id: c.id,
      tenantId: c.tenantId,
      name: c.name,
      phone: c.phone,
      address: c.address,
      latitude: c.latitude != null ? Number(c.latitude) : null,
      longitude: c.longitude != null ? Number(c.longitude) : null,
      locationAccuracy: c.locationAccuracy != null ? Number(c.locationAccuracy) : null,
      status: c.status as CustomerStatus,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  async findById(id: string, tenantId: string): Promise<Customer | null> {
    const c = await this.prisma.customer.findFirst({ where: { id, tenantId } });
    return c ? this.mapToDomain(c) : null;
  }

  async findAll(tenantId: string): Promise<Customer[]> {
    const customers = await this.prisma.customer.findMany({ where: { tenantId } });
    return customers.map((c) => this.mapToDomain(c));
  }

  async create(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Customer> {
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
    return this.mapToDomain(c);
  }

  async update(id: string, data: Partial<Omit<Customer, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>): Promise<Customer> {
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
    return this.mapToDomain(c);
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
    return this.mapToDomain(updated!);
  }
}
