import { Controller, Post } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MessagingApplicationService } from '../application/messaging.application.service';

/** Manual trigger for testing overdue reminders (still respects 7-day window in DB). */
@Controller('messaging')
export class MessagingTestController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly messaging: MessagingApplicationService,
  ) {}

  @Post('test/overdue-run')
  async runOverdue() {
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
    let sent = 0;
    for (const inv of overdue) {
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
      sent += 1;
    }
    return { checked: overdue.length, sent };
  }
}
