import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MessagingApplicationService } from '../application/messaging.application.service';

@Injectable()
export class OverdueRemindersCron {
  private readonly log = new Logger(OverdueRemindersCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly messaging: MessagingApplicationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendOverdueReminders() {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const overdue = await this.prisma.invoice.findMany({
      where: {
        status: { in: [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE] },
        dueDate: { lt: now },
        OR: [
          { lastOverdueReminderSentAt: null },
          { lastOverdueReminderSentAt: { lt: sevenDaysAgo } },
        ],
      },
      include: { customer: true },
    });

    for (const inv of overdue) {
      try {
        await this.messaging.sendOverdueReminder({
          customerName: inv.customer.name,
          customerPhone: inv.customer.phone,
          invoiceNumber: inv.invoiceNumber,
          amount: inv.amount,
          dueDate: inv.dueDate,
        });
        await this.prisma.invoice.update({
          where: { id: inv.id },
          data: { lastOverdueReminderSentAt: now },
        });
      } catch (e) {
        this.log.warn(`Overdue reminder failed for invoice ${inv.id}`, e);
      }
    }
  }
}
