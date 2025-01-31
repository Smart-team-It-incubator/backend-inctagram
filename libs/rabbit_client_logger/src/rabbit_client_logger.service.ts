import { Injectable } from '@nestjs/common';
import { Client, Transport, ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitClientLoggerService {
    @Client({
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'log_queue', // Имя очереди, куда отправляются логи
          queueOptions: { durable: true, autoDelete: false, },
        },
      })
      client: ClientProxy;
    
      log(data: any) {
        console.log('Отправляем лог:', data);  // Логируем отправляемые данные
        this.client.emit('log_event', {
          level: 'info',
          message: data.message,
          timestamp: new Date().toISOString(),
        });
      }
      
      error(data: any) {
        console.log('Отправляем ошибку:', data);  // Логируем отправляемые данные
        this.client.emit('log_event', {
          level: 'error',
          message: data.message,
          timestamp: new Date().toISOString(),
        });
      }
}
