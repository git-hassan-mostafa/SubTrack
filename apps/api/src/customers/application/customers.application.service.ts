import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomerStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomersApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.customer.findMany({
      where: { tenantId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getById(tenantId: string, id: string) {
    const row = await this.prisma.customer.findFirst({ where: { id, tenantId } });
    if (!row) throw new NotFoundException();
    return row;
  }

  async create(
    tenantId: string,
    data: {
      name: string;
      phone: string;
      address: string;
      latitude?: number;
      longitude?: number;
      locationAccuracy?: number;
      status?: CustomerStatus;
    },
  ) {
    this.validateCoords(data.latitude, data.longitude);
    return this.prisma.customer.create({
      data: {
        tenantId,
        name: data.name,
        phone: data.phone,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        locationAccuracy: data.locationAccuracy,
        status: data.status ?? CustomerStatus.ACTIVE,
      },
    });
  }

  async update(
    tenantId: string,
    id: string,
    data: Partial<{
      name: string;
      phone: string;
      address: string;
      latitude: number | null;
      longitude: number | null;
      locationAccuracy: number | null;
      status: CustomerStatus;
    }>,
  ) {
    await this.getById(tenantId, id);
    if (data.latitude !== undefined || data.longitude !== undefined) {
      this.validateCoords(
        data.latitude ?? undefined,
        data.longitude ?? undefined,
      );
    }
    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.getById(tenantId, id);
    return this.prisma.customer.update({
      where: { id },
      data: { status: CustomerStatus.INACTIVE },
    });
  }

  private validateCoords(lat?: number, lng?: number) {
    if (lat === undefined && lng === undefined) return;
    if (lat !== undefined && (lat < -90 || lat > 90)) {
      throw new BadRequestException('latitude must be between -90 and 90');
    }
    if (lng !== undefined && (lng < -180 || lng > 180)) {
      throw new BadRequestException('longitude must be between -180 and 180');
    }
  }
}
