import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from 'src/common/utils/mailer.util';
import { FinalReservation } from '../reservations/schemas/final-reservation.schema';
import { FinalReceipt } from '../reservations/schemas/final-receipt.schema';
import { User } from '../users/schemas/user.schema';
import { Vehicle } from '../vehicles/schemas/vehicle.schema';
import { convertUtcToTimezone } from 'src/common/utils/time.util';

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

  async sendConfirmationEmail(
    mailData: {
      reservation: FinalReservation;
      invoiceData: FinalReceipt;
      vehicle: Vehicle;
      user: User;
      extrasSelected: Array<Object> | string;
    },
    paymentId: string,
    isOffer: boolean = false,
  ): Promise<boolean> {
    try {
      const { reservation, invoiceData, user, extrasSelected, vehicle } = mailData;
      const currencyName = invoiceData.currencyInfo?.currency;
      const currencyPrice = invoiceData.currencyInfo?.currencyRate ?? 1;

      const startTime = convertUtcToTimezone(String(reservation.pickupDate), reservation.timezone);
      const endTime = convertUtcToTimezone(String(reservation.dropDate), reservation.timezone);

      const carModel = vehicle?.model_name;
      const carType = vehicle?.specs.Model;

      let paymentType = '';
      switch (reservation.paymentType) {
        case 'FULL':
          paymentType = '(Full payment)';
          break;
        case 'PART':
          paymentType = '(Partial payment)';
          break;
      }


      

       const priceLine = (label: string, amount: number) =>
      `<div><span class="label">${label}:</span> ${(amount * currencyPrice).toFixed(2)} ${currencyName}</div>`;

    const offerLines = isOffer
      ? `
        ${priceLine('Offer Base Rate', invoiceData.baseRate)}
        ${priceLine('Actual Base Rate', invoiceData.baseRate + invoiceData.discount)}
        ${priceLine('Offer Discount', invoiceData.discount)}
      `
      : priceLine('Base Rate', invoiceData.baseRate);

    const discountLine = !isOffer ? priceLine('Discount', invoiceData.discount) : '';

 

    
    const subject = `Booking Confirmation - ${reservation.order_reference_number}`;
    const html =  `
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
          <div class="header">Dear <b>${user.firstName}</b>,</div>
          <p>We are pleased to confirm your car rental booking with us. Here are your reservation details:</p>

          <div class="section"><span class="label">Reservation Id:</span> ${reservation.order_reference_number}</div>
          <div class="section"><span class="label">Payment Id:</span> ${paymentId}</div>
          <div class="section"><span class="label">Booking Status:</span> Confirmed</div>
          <div class="section"><span class="label">Booking Period:</span> From ${startTime} to ${endTime}</div>
          <div class="section"><span class="label">Pick-up Location:</span> ${reservation.pickupLocation}</div>
          <div class="section"><span class="label">Drop-off Location:</span> ${reservation.dropLocation}</div>
          <div class="section"><span class="label">Vehicle:</span> ${carType}</div>
          <div class="section"><span class="label">Addons Selected:</span> ${extrasSelected}</div>

          <div class="section"><span class="label">Price Breakup:</span></div>
          <div class="section" style="margin-left: 20px;">
            ${offerLines}
            ${priceLine('Addons Charges', invoiceData.addOns)}
            ${priceLine('Total Tax (5% VAT)', invoiceData.totalTax)}
            ${priceLine('Grand Total', invoiceData.totalFare)} ${paymentType}
            ${discountLine}
            ${priceLine('Due Amount', invoiceData.amount_to_be_collected)}
          </div>

          <div class="section"><span class="label">Contact Number:</span> ${user.contact}</div>
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
        to: user.emailID.toLowerCase(),
        subject,
        html,
      });

      logger.log(`Booking confirmation mail sent to ${user.emailID}`);
      return true;

    } catch (error) {
      logger.error(`Failed to send booking confirmation mail: ${error.message}`, error.stack);
      return false;
    }
  }

}
