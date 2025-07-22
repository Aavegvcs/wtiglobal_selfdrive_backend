import { Controller } from "@nestjs/common";
import { WhatsappService } from "./whatsapp.service";

@Controller('whatsapp')
export class WhatsappController {

    constructor(private readonly whatsappService: WhatsappService) {}
    
    async sendOtpOnWhatsapp(contact: string, otp: number) : Promise<any> {
        return await this.whatsappService.sendOtpOnWhatsapp(contact, otp);
    }
}

