import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQInitializerService {
  async onModuleInit() {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL);
      const channel = await connection.createChannel();
  
      await channel.assertQueue('email_queue', {
        durable: true,
      });
    } catch (error) {
      console.log(error)
    }


    console.log('Queue email_queue created or already exists.');
  }
}