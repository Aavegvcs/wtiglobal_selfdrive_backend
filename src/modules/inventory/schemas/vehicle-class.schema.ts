import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VehicleClassDocument = VehicleClass & Document;

@Schema({ timestamps: true, collection: 'sd_vehicle_classes' })
export class VehicleClass {
  @Prop({ required: true })
  imageUrl: String;

  @Prop({ required: true })
  className: String;
}

export const VehicleClassSchema = SchemaFactory.createForClass(VehicleClass);