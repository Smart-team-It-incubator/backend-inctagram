import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private readonly botToken = process.env.BOT_TOKEN;
  private readonly apiUrl = `https://api.telegram.org/bot${this.botToken}`;

  async sendMessage(chatId: string, message: string): Promise<void> {
    try {
      const url = `${this.apiUrl}/sendMessage`;
      await axios.post(url, {
        chat_id: chatId,
        text: message,
      });
    } catch (error) {
      console.error('Ошибка отправки сообщения в Telegram:', error);
    }
  }
}
