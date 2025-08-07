import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class Extras extends Document {
  @Prop({ required: true, trim: true })
  countryName: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '' })
  img: string;

  @Prop({ default: '' })
  description: string;

  @Prop({
    type: {
      daily: { type: Number, default: 0 },
      maximum: { type: Number, default: 0 },
    },
    default: () => ({ daily: 0, maximum: 0 }),
  })
  price: {
    daily: number;
    maximum: number;
  };

  @Prop()
  baseCurrency: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const ExtrasSchema = SchemaFactory.createForClass(Extras);
