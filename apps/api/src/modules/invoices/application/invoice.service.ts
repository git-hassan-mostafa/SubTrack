import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { INVOICE_REPOSITORY, InvoiceRepository } from '../domain/invoice.repository';
import { CreateInvoiceDto, UpdateInvoiceDto } from '../presentation/dto/invoice.dto';
import { InvoiceStatus } from '@subtrack/shared';
import { PricingService } from '../../pricing-rules/domain/pricing.service';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InvoiceCreatedEvent } from '../../messaging/application/messaging.service';

@Injectable()
export class InvoiceService {
  constructor(
    @Inject(INVOICE_REPOSITORY) private readonly invoiceRepo: InvoiceRepository,
    private readonly pricingService: PricingService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(tenantId: string) {
    const invoices = await this.invoiceRepo.findAll(tenantId);
    const now = new Date();

    const updated = await Promise.all(
      invoices.map(async (inv) => {
        if (inv.status === InvoiceStatus.PENDING && new Date(inv.dueDate) < now) {
          return this.invoiceRepo.updateStatus(inv.id, tenantId, InvoiceStatus.OVERDUE);
        }
        return inv;
      }),
    );

    return updated;
  }

  async findById(id: string, tenantId: string) {
    let invoice = await this.invoiceRepo.findById(id, tenantId);
    if (!invoice) throw new NotFoundException('Invoice not found');

    if (invoice.status === InvoiceStatus.PENDING && new Date(invoice.dueDate) < new Date()) {
      invoice = await this.invoiceRepo.updateStatus(id, tenantId, InvoiceStatus.OVERDUE);
    }

    return invoice;
  }

  async generate(tenantId: string, dto: CreateInvoiceDto) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { id: dto.subscriptionId, tenantId },
      include: { pricingRule: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status !== 'ACTIVE') {
      throw new BadRequestException('Cannot generate invoice for a non-active subscription');
    }

    // Use customRate if set, otherwise calculate from pricing rule
    const amount =
      subscription.customRate != null
        ? Number(subscription.customRate)
        : this.pricingService.calculateAmount(
            subscription.pricingRule as any,
            subscription.amperes != null ? Number(subscription.amperes) : null,
          );

    const invoice = await this.invoiceRepo.create({
      tenantId,
      customerId: subscription.customerId,
      subscriptionId: subscription.id,
      invoiceNumber: '',
      amount,
      status: InvoiceStatus.PENDING,
      issuedDate: new Date(),
      dueDate: new Date(dto.dueDate),
      notes: dto.notes ?? null,
    });

    this.eventEmitter.emit('invoice.created', new InvoiceCreatedEvent(invoice.id));

    return invoice;
  }

  async update(id: string, tenantId: string, dto: UpdateInvoiceDto) {
    await this.findById(id, tenantId);
    return this.invoiceRepo.update(id, {
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
  }

  async cancel(id: string, tenantId: string) {
    const invoice = await this.findById(id, tenantId);
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot cancel a paid invoice');
    }
    return this.invoiceRepo.updateStatus(id, tenantId, InvoiceStatus.CANCELLED);
  }
}
