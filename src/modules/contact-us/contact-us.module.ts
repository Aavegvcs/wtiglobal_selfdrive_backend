import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactUs, ContactUsSchema } from './schemas/contact-us.schema';
import { ContactUsService } from './contact-us.service';
import { ContactUsController } from './contact-us.controller';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from '../mails/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ContactUs.name, schema: ContactUsSchema }]),
    ConfigModule,
    MailModule
  ],
  controllers: [ContactUsController],
  providers: [ContactUsService],
})
export class ContactUsModule {}
