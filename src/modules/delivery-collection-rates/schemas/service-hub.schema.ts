// service-hub.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true, collection: 'sd_service_hubs' })
export class ServiceHub extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'ServiceRegions', required: true })
  serviceRegion: Types.ObjectId;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
  })
  type: string;

  @Prop({
    type: [Number], // [lng, lat]
    required: true,
  })
  coordinates: [number, number];
}

export const ServiceHubSchema = SchemaFactory.createForClass(ServiceHub);
ServiceHubSchema.index({ coordinates: '2dsphere' });
