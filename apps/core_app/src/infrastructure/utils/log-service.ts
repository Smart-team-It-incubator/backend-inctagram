import { Injectable } from '@nestjs/common';
import { ClientProxy, Client, Transport } from '@nestjs/microservices';

@Injectable()
export class LogService {
  @Client({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL],
      queue: 'log_queue',
      queueOptions: { durable: true },
    },
  })
  private client: ClientProxy;

  log(message: string, context?: string) {
    this.client.emit('log_event', { level: 'info', message, context });
  }

  error(message: string, trace?: string, context?: string) {
    this.client.emit('log_event', { level: 'error', message, trace, context });
  }
}
