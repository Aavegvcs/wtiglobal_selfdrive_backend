import { Controller } from "@nestjs/common";
import { WhatsappService } from "./whatsapp.service";
import { WhatsappBookingDto } from "./dto/booking.whatsapp..dto";

@Controller('whatsapp')
export class WhatsappController {

    constructor(private readonly whatsappService: WhatsappService) {}
    
    async sendOtpOnWhatsapp(contact: string, otp: number) : Promise<any> {
        return await this.whatsappService.sendOtpOnWhatsapp(contact, otp);
    }

    async sendBookingMessage(bookingData: WhatsappBookingDto) : Promise<any> {
        return await this.whatsappService.sendBookingMessage(bookingData);
    }
}

