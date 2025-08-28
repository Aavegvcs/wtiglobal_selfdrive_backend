import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

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
}
