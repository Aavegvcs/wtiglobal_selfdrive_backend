import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'sd_service_regions' })
export class ServiceRegions extends Document {
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  country: string;

  @Prop({ default: null })
  parentCity: string;

  @Prop({ required: true })
  cityName: string;

  @Prop({
    type: {
      type: { type: String, enum: ['Polygon'], required: true },
      coordinates: { type: [[[Number]]], required: true },
    }
  })
  cityCoordinates: {
    type: string;
    coordinates: number[][][];
  };
}

export const ServiceRegionsSchema =
  SchemaFactory.createForClass(ServiceRegions);

// ✅ Fix: index nested field properly
ServiceRegionsSchema.index({ 'cityCoordinates': '2dsphere' });
