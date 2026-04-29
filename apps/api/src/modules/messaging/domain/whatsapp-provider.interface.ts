export const WHATSAPP_PROVIDER = 'WHATSAPP_PROVIDER';

export interface SendMessageOptions {
  to: string; // The customer's phone number
  body: string; // The text content of the message
}

export interface IWhatsAppProvider {
  /**
   * Send a template or raw message to a phone number
   */
  sendMessage(options: SendMessageOptions): Promise<void>;
}
