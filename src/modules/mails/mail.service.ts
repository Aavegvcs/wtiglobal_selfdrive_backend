import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from 'src/common/utils/mailer.util';

const logger = new Logger('MailService');

@Injectable()
export class MailService {

  constructor(
    private readonly mailerService: MailerService // You can inject a wrapper for nodemailer here
  ) {}

  async sendOtpToMail(emailID: string, name: string, otp: number): Promise<boolean> {
    try {
      const subject = 'Team WTi - One Time Password';

      const html = `
        <!DOCTYPE html>
        <html>
        <body>
          <p>Hi ${name},</p>
          <br>
          <p>There was a request for OTP.</p>
          <p>If you did not make the request, then please ignore the email.</p>
          <p>Otherwise, please use the One Time Password (OTP) below, It will expire in 5 mins.</p>
          <br>
          <p style="text-align:center;font-weight: 800; font-size:24px;">${otp}</p>
          <br>
          <p>Regards,</p>
          <p>Team WTi</p>
        </body>
        </html>
      `;

      await this.mailerService.mailSender({
        to: emailID.toLowerCase(),
        subject,
        html,
      });

      logger.log(`Successfully sent mail to ${emailID.toLowerCase()}`)
      return true;
    } catch (error) {
      logger.error('Error sending OTP mail', error.stack);
      return false;
    }
  }
}
