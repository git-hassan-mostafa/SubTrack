import { Injectable, Logger } from '@nestjs/common';
import type { IWhatsAppProvider, WhatsAppSendResult } from '../domain/whatsapp-provider.port';

@Injectable()
export class ConsoleWhatsAppProvider implements IWhatsAppProvider {
  private readonly log = new Logger(ConsoleWhatsAppProvider.name);

  async sendMessage(phoneNumber: string, message: string): Promise<WhatsAppSendResult> {
    this.log.log(`[WhatsApp stub] -> ${phoneNumber}: ${message}`);
    return { success: true, messageId: `stub-${Date.now()}` };
  }
}
