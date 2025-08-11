import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ContactUsService } from './contact-us.service';
import { CreateContactUsDto } from './dto/create-contact-us.dto';

@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Post('addContactUsQuery')
  async addContactUsQuery(@Body() dto: CreateContactUsDto, @Res() res: Response) {
    const response = await this.contactUsService.createContactUsQuery(dto);
    return res.status(response.statusCode).json(response);
  }
}
