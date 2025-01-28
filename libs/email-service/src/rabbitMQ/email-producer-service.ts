import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class EmailProducerService {
  constructor(@Inject('EMAIL_SERVICE') private readonly client: ClientProxy) {}

  async sendEmailTask(payload: { email: string; subject: string; body: string }) {
    return this.client.emit('send_email', payload); // Отправка события "send_email"
  }

  async sendEmailConfirmationMessage(payload: {email: string, confirmationCode: string}) {
    // Отправляем сообщение с данными для подтверждения email
    
    console.log("Попали в EmailProducerService sendEmailConfirmationMessage");
    const result = this.client.emit('send_email_confirmation', payload);
    return result
  }
}
