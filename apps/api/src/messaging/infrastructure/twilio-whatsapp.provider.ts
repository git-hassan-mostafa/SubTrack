import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';
import type { IWhatsAppProvider, WhatsAppSendResult } from '../domain/whatsapp-provider.port';

@Injectable()
export class TwilioWhatsAppProvider implements IWhatsAppProvider {
  private readonly log = new Logger(TwilioWhatsAppProvider.name);

  constructor(private readonly config: ConfigService) {}

  async sendMessage(phoneNumber: string, message: string): Promise<WhatsAppSendResult> {
    const sid = this.config.get<string>('TWILIO_ACCOUNT_SID');
    const token = this.config.get<string>('TWILIO_AUTH_TOKEN');
    const from = this.config.get<string>('TWILIO_WHATSAPP_FROM');
    if (!sid || !token || !from) {
      this.log.warn('Twilio credentials missing; skipping send');
      return { success: false, messageId: '' };
    }
    const client = twilio(sid, token);
    const res = await client.messages.create({
      from,
      to: `whatsapp:${phoneNumber.replace(/^whatsapp:/, '')}`,
      body: message,
    });
    return { success: true, messageId: res.sid };
  }
}
