import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import axios from 'axios';
import * as nodemailer from 'nodemailer';


@Injectable()
export class EmailAdapterService {
	private transporter;
	constructor() {
		this.transporter = nodemailer.createTransport({
			host: 'mail.hosting.reg.ru', // Хост вашего почтового сервиса
			port: 587,                  // Порт (обычно 587 для TLS)
			secure: false,              // true для 465, false для других портов
			tls: {
				ciphers:'SSLv3'
			},
			auth: {
			  user: process.env.EMAIL_USER, // Ваш почтовый адрес
			  pass: process.env.EMAIL_PASSWORD,          // Пароль
			},
		  });
	}

  /**
   * Метод для отправки письма
   */
  async sendEmail(to: string, subject: string, text: string, html?: string) {
    
	try {
		const mailOptions = {
			from: 'it-project@smart-reg.org.ru',
			to,
			subject,
			text,
			html,
		  };
	  
		  return this.transporter.sendMail(mailOptions);
	} catch (error) {
		throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
	}
	
  }

}
