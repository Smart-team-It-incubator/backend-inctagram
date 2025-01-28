import { Controller, Inject } from "@nestjs/common";
import { ClientOptions, ClientProxyFactory, EventPattern, MessagePattern, Payload, Transport } from "@nestjs/microservices";
import { EmailAdapterService } from "../email-service.service";

@Controller()
export class EmailConsumerService {

  constructor(
    private readonly emailService: EmailAdapterService
  ) {
    if (!emailService) {
      throw new Error('EmailAdapterService is not provided');
    }
    try {
      console.log('Consumer initialized and waiting for messages...');
    } catch (error) {
      console.error('Error initializing consumer:', error);
    }
  }

  @MessagePattern('send_email_confirmation') // Используем EventPattern
  async handleSendEmail(@Payload() payload: { email: string; confirmationCode: string }) {
    console.log('Received message for sending email:', payload);

    try {
      // Логируем начало процесса
      console.log(`Sending email to ${payload.email} with confirmation code ${payload.confirmationCode}`);
      const result = await this.emailService.sendEmailConfirmationMessage(payload.email, payload.confirmationCode);
      console.log('Email sent successfully:', result);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
