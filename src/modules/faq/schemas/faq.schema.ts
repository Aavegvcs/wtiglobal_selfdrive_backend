import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { FaqType } from 'src/common/enums/faq-type.enum';

export type FaqDocument = Faq & Document;

@Schema({ collection: 'sd_faqs' })
export class Faq {
  @Prop({ required: true })
  countryCode: string;

  @Prop({ enum: FaqType, required: true })
  type: FaqType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
