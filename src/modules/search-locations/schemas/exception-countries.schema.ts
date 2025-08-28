import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ExceptionCountryDocument = ExceptionCountry & Document;

@Schema({ collection: "exception countries", timestamps: true })
export class ExceptionCountry {
  @Prop({ required: true })
  city: string;

  @Prop({ default: null })
  state: string;

  @Prop({ default: null })
  country: string;
}

export const ExceptionCountrySchema = SchemaFactory.createForClass(ExceptionCountry);
