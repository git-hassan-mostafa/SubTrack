import { Module } from '@nestjs/common';
import { MessagingService } from './application/messaging.service';
import { TwilioWhatsAppProvider } from './infrastructure/twilio-whatsapp.provider';
import { WHATSAPP_PROVIDER } from './domain/whatsapp-provider.interface';
import { PrismaModule } from '../../infrastructure/database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: WHATSAPP_PROVIDER,
      useClass: TwilioWhatsAppProvider,
    },
    MessagingService,
  ],
  exports: [MessagingService, WHATSAPP_PROVIDER],
})
export class MessagingModule {}
