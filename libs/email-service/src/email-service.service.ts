import { HttpException, HttpStatus } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators/core';
import * as nodemailer from 'nodemailer';
import { TelegramService } from './telegram-service';

@Injectable()
export class EmailAdapterService {
	private transporter;
	private isEmailEnabled = process.env.ENABLE_EMAIL_SENDING === 'true';

	constructor(
		private readonly telegramService: TelegramService
	) {
		this.transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',//'mail.hosting.reg.ru', // Хост вашего почтового сервиса
			port: 587, // Порт (обычно 587 для TLS)
			secure: false, // true для 465, false для других портов
			tls: {
				ciphers: 'SSLv3',
			},
			auth: {
				user: process.env.EMAIL_USER, // Ваш почтовый адрес
				pass: process.env.EMAIL_PASSWORD, // Пароль
			},
			connectionTimeout: 15000, // Увеличено время ожидания на соединение
			socketTimeout: 15000, // Увеличено время ожидания на сокет
			debug: true,               // Включение отладки
			
		});
	}

	/**
	 * Базовый метод для отправки письма
	 */
	async sendEmail(to: string, subject: string, text: string, html?: string): Promise<object> {
		if (!this.isEmailEnabled) return {} // Выключаем отправку писем глобально, возвращаем пустой объект
		try {
			const mailOptions = {
				from: 'it-project@smart-reg.org.ru', // Ваш email отправителя
				to,
				subject,
				text,
				html,
			};

			// Дублирование сообщения в Telegram
			const telegramMessage = `📧 Email отправлен:\nTo: ${to}\nSubject: ${subject}\nBody: ${text}`;
			await this.telegramService.sendMessage('490130518', telegramMessage);

			const response = await this.transporter.sendMail(mailOptions);
    
			// Логирование успешного ответа
			console.log('Email отправлен успешно:', response);
		} catch (error) {
			console.error('Ошибка отправки письма:', error);
			throw new HttpException(`Ошибка отправки письма: ${error.message}`, HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Отправка письма для подтверждения email
	 */
	async sendEmailConfirmationMessage(userEmail: string, confirmationCode: string): Promise<object> {
		if (!this.isEmailEnabled) return {} // Выключаем отправку писем глобально, возвращаем пустой объект
		const siteName = process.env.SITE_NAME || 'Inctagram'; // Имя вашего сайта
		const domainRoot = process.env.DOMAIN_ROOT || 'smart-reg.org.ru'; // Домен вашего сайта

		const subject = `Registration at ${siteName}`;
		const textMessage = `Thanks for registering at ${siteName}. To complete your registration, follow the confirmation link.`;
		const htmlMessage = `
<h1>Thanks for your registration</h1>
<p>To finish registration please confirm your email by clicking the link below:

  <a href="http://smart-reg.org.ru/auth/signUp/emailConfirmation?code=${confirmationCode}">Confirm email</a>
</p>
<p>
  <a href="https://${domainRoot}/users/unsubscribe">Unsubscribe</a>
</p>`;
		// Дублирование сообщения в Telegram
		// const telegramMessage = `📧 Email отправлен:\nTo: ${userEmail}\nBody: ${htmlMessage}`;
		// await this.telegramService.sendMessage('490130518', telegramMessage);

		try {
			return this.sendEmail(userEmail, subject, textMessage, htmlMessage);
		} catch (error) {
			console.log(error)
		}
		
	}

	/**
	 * Отправка письма для восстановления пароля
	 */
	async sendPasswordRecoveryMessage(userEmail: string, recoveryCode: string): Promise<object> {
		if (!this.isEmailEnabled) return {} // Выключаем отправку писем глобально, возвращаем пустой объект
		const domainRoot = process.env.DOMAIN_ROOT || 'example.com'; // Домен вашего сайта

		const subject = 'Password recovery at our web-site';
		const textMessage = `To recover your password, please follow the link below.`;
		const htmlMessage = `
<h1>Password recovery</h1>
<p>To finish password recovery please follow the link below:
  <a href="https://smart-reg.org.ru/auth/newPassword?recoveryCode=${recoveryCode}">Recovery password</a>
</p>`;

		// Дублирование сообщения в Telegram
		// const telegramMessage = `📧 Email отправлен:\nTo: ${userEmail}\nBody: ${htmlMessage}`;
		// await this.telegramService.sendMessage('490130518', telegramMessage);
		return this.sendEmail(userEmail, subject, textMessage, htmlMessage);
	}
}
