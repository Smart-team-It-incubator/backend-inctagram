import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailAdapterService {
	private transporter;

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: 'mail.hosting.reg.ru', // Хост вашего почтового сервиса
			port: 587, // Порт (обычно 587 для TLS)
			secure: false, // true для 465, false для других портов
			tls: {
				ciphers: 'SSLv3',
			},
			auth: {
				user: process.env.EMAIL_USER, // Ваш почтовый адрес
				pass: process.env.EMAIL_PASSWORD, // Пароль
			},
		});
	}

	/**
	 * Базовый метод для отправки письма
	 */
	async sendEmail(to: string, subject: string, text: string, html?: string): Promise<object> {
		try {
			const mailOptions = {
				from: 'it-project@smart-reg.org.ru', // Ваш email отправителя
				to,
				subject,
				text,
				html,
			};

			return this.transporter.sendMail(mailOptions);
		} catch (error) {
			throw new HttpException(`Ошибка отправки письма: ${error.message}`, HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * Отправка письма для подтверждения email
	 */
	async sendEmailConfirmationMessage(userEmail: string, confirmationCode: string): Promise<void> {
		const siteName = process.env.SITE_NAME || 'Inctagram'; // Имя вашего сайта
		const domainRoot = process.env.DOMAIN_ROOT || 'smart-reg.org.ru'; // Домен вашего сайта

		const subject = `Registration at ${siteName}`;
		const textMessage = `Thanks for registering at ${siteName}. To complete your registration, follow the confirmation link.`;
		const htmlMessage = `
<h1>Thanks for your registration</h1>
<p>To finish registration please confirm your email by clicking the link below:
  <a href="https://${domainRoot}/emailConfirmation?code=${confirmationCode}">Confirm email</a>
</p>
<p>
  <a href="https://${domainRoot}/unsubscribe">Unsubscribe</a>
</p>`;

		await this.sendEmail(userEmail, subject, textMessage, htmlMessage);
	}

	/**
	 * Отправка письма для восстановления пароля
	 */
	async sendPasswordRecoveryMessage(userEmail: string, recoveryCode: string): Promise<void> {
		const domainRoot = process.env.DOMAIN_ROOT || 'example.com'; // Домен вашего сайта

		const subject = 'Password recovery at our web-site';
		const textMessage = `To recover your password, please follow the link below.`;
		const htmlMessage = `
<h1>Password recovery</h1>
<p>To finish password recovery please follow the link below:
  <a href="https://${domainRoot}/password-recovery?recoveryCode=${recoveryCode}">Recover password</a>
</p>`;

		await this.sendEmail(userEmail, subject, textMessage, htmlMessage);
	}
}
