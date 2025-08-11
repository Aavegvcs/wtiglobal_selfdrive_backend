import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContactUs, ContactUsDocument } from './schemas/contact-us.schema';
import { CreateContactUsDto } from './dto/create-contact-us.dto';
import { ConfigService } from '@nestjs/config';
import { MailerService } from 'src/common/utils/mailer.util';
import { MailService } from '../mails/mail.service';
import { standardResponse } from 'src/common/helpers/response.helper';

@Injectable()
export class ContactUsService {
  constructor(
    @InjectModel(ContactUs.name) private contactUsModel: Model<ContactUsDocument>,
    private readonly mailService: MailService,
  ) {}

  async createContactUsQuery(dto: CreateContactUsDto) {

    try {
        // Save to DB
        await this.contactUsModel.create(dto);

        // Send email
        await this.mailService.sendMailToWti(dto);

        return standardResponse(
              true,
              'Successfully added contactUsQuery',
              200,
              null,
              null,
              '/createContactUsQuery',
            );
    } catch (error) {
        return standardResponse(
              false,
              'Internal Server Error',
              500,
              null,
              error.stack,
              '/createContactUsQuery',
            );
    }
    
  }

}
