import { Injectable, Logger } from '@nestjs/common';
import { IWhatsAppProvider, SendMessageOptions } from '../domain/whatsapp-provider.interface';
import * as twilio from 'twilio';

@Injectable()
export class TwilioWhatsAppProvider implements IWhatsAppProvider {
  private readonly logger = new Logger(TwilioWhatsAppProvider.name);
  private client: twilio.Twilio | null = null;
  private fromNumber: string | undefined;
  
  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_WHATSAPP_FROM;

    if (accountSid && authToken && this.fromNumber) {
      this.client = twilio(accountSid, authToken);
      this.logger.log('Twilio client initialized.');
    } else {
      this.logger.warn('Twilio credentials missing. WhatsApp messages will only be logged.');
    }
  }

  async sendMessage(options: SendMessageOptions): Promise<void> {
    try {
      // Format number to ensure it starts with standard E.164 and whatsapp prefix
      // If we are given standard E.164, we prefix with "whatsapp:"
      const toFormat = options.to.startsWith('+') ? `whatsapp:${options.to}` : `whatsapp:+${options.to}`;

      if (!this.client) {
         this.logger.log(`[DRY RUN] Would send WhatsApp to ${toFormat}: ${options.body}`);
         return;
      }

      await this.client.messages.create({
        from: this.fromNumber,
        to: toFormat,
        body: options.body,
      });
      
      this.logger.log(`WhatsApp message sent to ${toFormat}`);
    } catch (error: any) {
      this.logger.error(`Failed to send WhatsApp message: ${error.message}`);
      // Depending on requirements we might throw or swallow tracking errors
    }
  }
}
