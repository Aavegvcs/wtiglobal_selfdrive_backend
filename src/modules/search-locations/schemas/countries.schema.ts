import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Countries extends Document {
  @Prop({ required: true, unique: true }) country: string;

  @Prop({ required: true, unique: true, uppercase: true }) countryCode: string;
  
  @Prop({ default: false }) isActive: boolean;
}

export const CountrySchema = SchemaFactory.createForClass(Countries);
