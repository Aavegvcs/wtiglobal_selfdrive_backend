import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserController } from './users.controller';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { MailModule } from '../mails/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    WhatsappModule,
    MailModule
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UsersModule {}
