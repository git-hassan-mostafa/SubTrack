export interface WhatsAppSendResult {
  success: boolean;
  messageId: string;
}

export interface IWhatsAppProvider {
  sendMessage(phoneNumber: string, message: string): Promise<WhatsAppSendResult>;
}

export const WHATSAPP_PROVIDER = Symbol('WHATSAPP_PROVIDER');
