import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerService } from 'src/common/utils/mailer.util';

@Module({
  providers: [MailService, MailerService],
  exports: [MailService],
})
export class MailModule {}
