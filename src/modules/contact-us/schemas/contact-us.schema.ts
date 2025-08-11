import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContactUsDocument = ContactUs & Document;

@Schema({ timestamps: true, collection: 'sd_contact_us' })
export class ContactUs extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  contact: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: '' })
  slug?: string;
}

export const ContactUsSchema = SchemaFactory.createForClass(ContactUs);
