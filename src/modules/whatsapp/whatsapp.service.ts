import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { WhatsappBookingDto } from './dto/booking.whatsapp..dto';

const logger = new Logger('WhatsappService');

@Injectable()
export class WhatsappService {
private readonly clientId: string;
private readonly clientSecret: string;

constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
) {
    // ✅ Read env variables once in constructor
    this.clientId = this.configService.get<string>('WHATSAPP_CLIENT_ID') || "";
    this.clientSecret = this.configService.get<string>('WHATSAPP_CLIENT_SECRET') || "";
}

async sendOtpOnWhatsapp(recipient: string, otp: number) {
    try {
    const templateName = 'otp_verification_2';

    const sendData = {
        purpose: 'sendotp',
        otp: otp,
        to: recipient,
        template: templateName,
        code: 'en_US',
    };

    const url = `https://api.versal.one/${this.clientId}`;

    await firstValueFrom(
        this.httpService.post(url, sendData, {
        headers: {
            Authorization: `Bearer ${this.clientSecret}`,
            'Content-Type': 'application/json',
        },
        }),
    );

    logger.log('Whatsapp OTP sent successfully');
    return {
        message: 'OTP sent successfully',
        success: true,
    };
    } catch (error) {
    logger.error('Error from WhatsApp:', error.stack);
    return {
        success: false,
        message: error?.message || 'Failed to send whatsapp OTP',
    };
    }
}

async sendBookingMessage(data: WhatsappBookingDto) {
    try {
      const templateName = 'sd_final_booking1';

      const parameters = [
        { type: 'TEXT', text: data.firstName },
        { type: 'TEXT', text: data.order_reference_number },
        { type: 'TEXT', text: data.paymentId },
        { type: 'TEXT', text: data.tarrifType },
        { type: 'TEXT', text: data.pickupDate },
        { type: 'TEXT', text: data.dropDate },
        { type: 'TEXT', text: data.pickupLocation },
        { type: 'TEXT', text: data.dropLocation },
        { type: 'TEXT', text: data.vehicle },
        { type: 'TEXT', text: data.extrasSelected },
        { type: 'TEXT', text: data.baseFare },
        { type: 'TEXT', text: data.addOns },
        { type: 'TEXT', text: data.discount },
        { type: 'TEXT', text: data.tax },
        { type: 'TEXT', text: data.currency },
        { type: 'TEXT', text: data.grandTotal },
      ];

      const sendData = {
        purpose: 'sendtemplate',
        to: `${data.contact}${data.contactCode}`,
        template: templateName,
        code: 'en',
        components: [
          {
            type: 'body',
            parameters,
          },
        ],
      };

      const clientId = this.configService.get<string>('WHATSAPP_CLIENT_ID');
      const clientSecret = this.configService.get<string>('WHATSAPP_CLIENT_SECRET');

      await axios.post(`https://api.versal.one/${clientId}`, sendData, {
        headers: {
          Authorization: `Bearer ${clientSecret}`,
          'Content-Type': 'application/json',
        },
      });

      logger.log('Booking WhatsApp message sent successfully');

      return true;
    } catch (error) {
      logger.error('Error sending WhatsApp message:', error.stack);
      return false;
    }
  }
}
