import { Injectable, Logger, Type } from '@nestjs/common';
import { MailerService } from 'src/common/utils/mailer.util';
import { FinalReservation } from '../reservations/schemas/final-reservation.schema';
import { FinalReceipt } from '../reservations/schemas/final-receipt.schema';
import { User } from '../users/schemas/user.schema';
import { Vehicle } from '../vehicles/schemas/vehicle.schema';
import { convertUtcToTimezone } from 'src/common/utils/time.util';
import { CreateContactUsDto } from '../contact-us/dto/create-contact-us.dto';
import { ConfigService } from '@nestjs/config';
import { PaymentType } from 'src/common/enums/payment-type.enum';

const logger = new Logger('MailService');

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService, // You can inject a wrapper for nodemailer here
    private readonly configService: ConfigService,
  ) {}


  async sendOtpToMail(
    emailID: string,
    name: string,
    otp: number,
  ): Promise<boolean> {
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

      logger.log(`Successfully sent mail to ${emailID.toLowerCase()}`);
      return true;
    } catch (error) {
      logger.error('Error sending OTP mail', error.stack);
      return false;
    }
  }

  async sendConfirmationEmail(data: any): Promise<boolean> {
    try {
      
      let paymentType = '';
      switch (data.paymentType) {
        case PaymentType.FULL:
          paymentType = '(Full payment)';
          break;
        case PaymentType.PART:
          paymentType = '(Partial payment)';
          break;
      }


      const subject = `Booking Confirmation - ${data.order_reference_number}`;
      const html = `
      <!DOCTYPE html>
      <html><head>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          line-height: 1.6;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: auto;
          border: 1px solid #ddd;
          padding: 20px;
          border-radius: 8px;
        }
        .header {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 20px;
          color: #2c3e50;
        }
        .section {
          margin: 10px 0;
        }
        .section .label {
          font-weight: bold;
          color: #474242;
        }
        .footer {
          margin-top: 20px;
          font-size: 14px;
          color: #777;
        }
        .footer a {
          color: #3498db;
          text-decoration: none;
        }
        .footer a:hover {
          text-decoration: underline;
        }
        .wtiIcon {
          display: flex;
          justify-content: center;
        }
        .otpSize {
          font-size: 22px;
        }
      </style>
      </head>
      <body>
        <div class="container">
          <div class="header">Dear <b>${data.firstName}</b>,</div>
          <p>We are pleased to confirm your car rental booking with us. Here are your reservation details:</p>

          <div class="section">
              <span class="label">Reservation Number:</span> ${data.order_reference_number}
            </div>
            <div class="section">
              <span class="label">Rental Type:</span> ${data.rentalType}
            </div>
            <div class="section">
              <span class="label">Pickup Time:</span> ${data.pickupDate}
            </div>
            <div class="section">
              <span class="label">Drop Time:</span> ${data.dropDate}
            </div>
            <div class="section">
              <span class="label">Pickup Location:</span> ${data.pickupLocation}
            </div>
            <div class="section">
              <span class="label">Drop Location:</span> ${data.dropLocation}
            </div>
            <div class="section">
              <span class="label">Vehicle:</span> ${data.vehicle}
            </div>
            <div class="section">
              <span class="label">Extras Selected:</span> ${data.extrasSelected}
            </div>
            <div class="section">
              <span class="label">Base Fare:</span> ${data.baseFare} ${data.currency}
            </div>
            <div class="section">
              <span class="label">Discount:</span> ${data.discount} ${data.currency}
            </div>
            <div class="section">
              <span class="label">Grand Total:</span> ${data.grandTotal} ${data.currency}
            </div>

          <div class="section"><span class="label">Contact Number:</span> ${data.contactCode}-${data.contact}</div>
          <p>If you have any questions or require assistance, please don't hesitate to contact us.</p>

          <div class="footer">
            <p>We look forward to serving you and hope you have a pleasant experience with us.</p>
            <p>Thank you for choosing WISE TRAVEL INDIA LIMITED.</p>
            <p><b>Best regards,</b><br>Reservations Team<br>011-45434500, 9250057902<br>info@wti.co.in<br>Wise Travel India Ltd.<br><a href="https://www.wticabs.com">www.wticabs.com</a></p>
          </div>
        </div>
      </body>
      </html>`;

      await this.mailerService.mailSender({
        to: data.emailID.toLowerCase(),
        subject,
        html,
      });

      logger.log(`Booking confirmation mail sent to ${data.emailID}`);
      return true;
    } catch (error) {
      logger.error(
        `Failed to send booking confirmation mail: `, error.stack,
      );
      return false;
    }
  }

  async sendMailToWti(data: CreateContactUsDto) {
    const toMail: string = this.configService.get<string>('MAIL_USER')!;
    const subject = 'Self Drive: Feedback from user';
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; padding: 20px;">
          <p>Dear Team,</p>
          <p>We have received new customer feedback with the following details:</p>
          <ul>
            <li><strong>Name:</strong> ${data.name}</li>
            <li><strong>Email:</strong> ${data.email}</li>
            <li><strong>Contact Number:</strong> ${data.contact}</li>
            <li><strong>Location:</strong> ${data.location}</li>
          </ul>
          <p><strong>Feedback Description:</strong> ${data.description}</p>
          <p><strong>Source url:</strong> ${data?.slug ?? '/'}</p>
          <p>Please review this feedback and take any necessary actions.</p>
          <p>Best regards,<br>Your Team</p>
        </body>
      </html>
    `;

    await this.mailerService.mailSender({
      to: toMail,
      subject,
      html,
    });
  }

  async sendCancellationMail(
    data: any
  ): Promise<boolean> {
    try {
      const subject = `Cancellation for ${data.order_reference_number}`;
      let isRefundable: boolean = true;

      const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.6;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: auto;
              border: 1px solid #ddd;
              padding: 20px;
              border-radius: 8px;
            }
            .header {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #2c3e50;
            }
            .section {
              margin: 10px 0;
            }
            .section .label {
              font-weight: bold;
              color: #474242;
            }
            .footer {
              margin-top: 20px;
              font-size: 14px;
              color: #777;
            }
            .footer a {
              color: #3498db;
              text-decoration: none;
            }
            .footer a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">Dear <b>${data.firstName}</b>,</div>
            <p>
              We are writing to confirm that your self-drive reservation <b>${data.order_reference_number}</b> has been cancelled.
              ${
                isRefundable
                  ? `A refund of <b>${data.amountPaid} ${data.currency}</b> has been initiated and will be credited to your account within <b>5 to 7 working days</b>.`
                  : `No refund will be processed as the booking was cancelled less than the refundable time window.`
              }
            </p>
            <div class="section">
              <span class="label">Reservation Number:</span> ${data.order_reference_number}
            </div>
            <div class="section">
              <span class="label">Rental Type:</span> ${data.rentalType}
            </div>
            <div class="section">
              <span class="label">Pickup Time:</span> ${data.pickupDate}
            </div>
            <div class="section">
              <span class="label">Drop Time:</span> ${data.dropDate}
            </div>
            <div class="section">
              <span class="label">Pickup Location:</span> ${data.pickupLocation}
            </div>
            <div class="section">
              <span class="label">Drop Location:</span> ${data.dropLocation}
            </div>
            <div class="section">
              <span class="label">Vehicle:</span> ${data.vehicle}
            </div>
            <div class="section">
              <span class="label">Extras Selected:</span> ${data.extrasSelected}
            </div>
            <div class="section">
              <span class="label">Base Fare:</span> ${data.baseFare} ${data.currency}
            </div>
            <div class="section">
              <span class="label">Discount:</span> ${data.discount} ${data.currency}
            </div>
            <div class="section">
              <span class="label">Grand Total:</span> ${data.grandTotal} ${data.currency}
            </div>
            <div class="section"><span class="label">Contact Number:</span> ${data.contactCode}-${data.contact}</div>
            <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
            <div class="footer">
              <p>Thank you for choosing WISE TRAVEL INDIA LIMITED.</p>
              <p><b>Best regards,</b><br>
                Reservations Team<br>
                011-45434500, 9250057902<br>
                info@wti.co.in<br>
                Wise Travel India Ltd.<br>
                <a href="https://www.wticabs.com">www.wticabs.com</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

      // You should send the mail here, e.g.:
      await this.mailerService.mailSender({ to: data.emailID, subject, html });

      logger.log("Cancellation mail sent successfully.")
      return true;
    } catch (error) {
      logger.error('Error sending cancellation mail', error?.stack);
      return false
    }
  }
}
