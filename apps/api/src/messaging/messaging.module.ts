import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MessagingApplicationService } from './application/messaging.application.service';
import { WHATSAPP_PROVIDER } from './domain/whatsapp-provider.port';
import { ConsoleWhatsAppProvider } from './infrastructure/console-whatsapp.provider';
import { OverdueRemindersCron } from './infrastructure/overdue-reminders.cron';
import { TwilioWhatsAppProvider } from './infrastructure/twilio-whatsapp.provider';
import { MessagingTestController } from './presentation/messaging-test.controller';

@Module({
  imports: [ConfigModule],
  controllers: [MessagingTestController],
  providers: [
    ConsoleWhatsAppProvider,
    TwilioWhatsAppProvider,
    {
      provide: WHATSAPP_PROVIDER,
      useFactory: (config: ConfigService, consoleP: ConsoleWhatsAppProvider, twilioP: TwilioWhatsAppProvider) =>
        config.get<string>('MESSAGING_PROVIDER') === 'twilio' ? twilioP : consoleP,
      inject: [ConfigService, ConsoleWhatsAppProvider, TwilioWhatsAppProvider],
    },
    MessagingApplicationService,
    OverdueRemindersCron,
  ],
  exports: [MessagingApplicationService],
})
export class MessagingModule {}
