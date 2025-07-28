import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Countries } from './countries.schema';

@Schema({ timestamps: true })
export class Cities extends Document {
  @Prop({ required: true, unique: true }) city: string;
  @Prop({ required: true, uppercase: true }) countryCode: string;

  // 👇 Reference to Countries._id
  @Prop({ type: Types.ObjectId, ref: Countries.name, required: true })
  countryId: Types.ObjectId;
  
  @Prop({ default: false }) isActive: boolean;
}

export const CitySchema = SchemaFactory.createForClass(Cities);
