/* eslint-disable prettier/prettier */
// import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
// import { User } from 'src/utils/typeorm/User.entity';

@Injectable()
export class MailService {

  private transporter: nodemailer.Transporter;

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: 'smtp.gmail.com',
			port: 465,
			secure: true,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASSWORD,
			},
		}, {
			from: '"No Reply" <crunchypong42@gmail.com>',
		});
	}

	async sendUserConfirmation(email: string, code: string) {
		const codeFormated = code.substring(0, 4) + " - " + code.substring(4);

		if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
			console.log("code email: ", code);
		return this.transporter.sendMail({
			to: email,
			subject: 'Welcome to Crunchy Pong! Confirm your Email',
			html: `<p>Welcome to Crunchy Pong!</p><p>In order to finalize your registration,</p><p>Please enter this code to confirm your email:</p><p>${codeFormated}</p><p>If you did not request this email you can safely ignore it.</p>`,
		});
	}

	async sendUser2faVerification(email: string, code: string) {
		const codeFormated = code.substring(0, 4) + " - " + code.substring(4);

		if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
			console.log("code email: ", code);
		return this.transporter.sendMail({
			to: email,
			subject: 'Crunchy Pong, Verify your identity!',
			html: `<p>Securise your Crunchy account!</p><p>In order to activate the double authentification,</p><p>Please enter this code to first verify your identity:</p><p>${codeFormated}</p><p>If you did not request this email, you can safely ignore it.</p>`,
		});
	}

	async sendUserNewPassword(email: string, password: string) {
		if (process.env && process.env.ENVIRONNEMENT && process.env.ENVIRONNEMENT === "dev")
			console.log(password);
		return this.transporter.sendMail({
			to: email,
			subject: 'Crunchy Pong: here your new account access!',
			html: `<p>Your account settings have been updated!</p><p>Here is your new password,</p><p>Do not loose it!</p><p>${password}</p><p>You can change it in your profile settings, please update it as soon as you can for security reasons!</p><p>If you did not request this email, please change your password immediately in your account settings!</p>`,
		});
	}
  
	async sendMail(mailOptions: nodemailer.SendMailOptions) {
		return this.transporter.sendMail(mailOptions);
	}
}
