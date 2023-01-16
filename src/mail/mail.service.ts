import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendUserConfirmation(email: string, name: string, token: string) {
        const url = `http://localhost:3000/auth/confirm?t=${token}`;

        await this.mailerService.sendMail({
            to: email,
            from: '"Support Team" <support@nestjsauth.com>', // override default from
            subject: 'Welcome to NestJS Auth! Confirm your Email',
            template: './confirmation', // `.hbs` extension is appended automatically
            context: { // ✏️ filling curly brackets with content
                name: name,
                url,
            },
        });
    }

    async sendResetPassword(email: string, name: string, token: string) {
        const url = `http://localhost:3000/auth/reset_password?t=${token}`;

        await this.mailerService.sendMail({
            to: email,
            from: '"Support Team" <support@nestjsauth.com>', // override default from
            subject: 'NestJS Auth! Reset your Password',
            template: './forget_password', // `.hbs` extension is appended automatically
            context: { // ✏️ filling curly brackets with content
                name: name,
                url,
            },
        });
    }
}