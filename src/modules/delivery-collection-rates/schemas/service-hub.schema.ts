// service-hub.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


@Schema({ timestamps: true, collection: 'sd_service_hubs' })
export class ServiceHub extends Document {
  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  countryCode: string;

  @Prop({ required: true })
  address: string;


  @Prop({ type: Types.ObjectId, ref: 'sd_service_regions', required: true })
  serviceRegion: Types.ObjectId;

  @Prop({
    type: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    }
  })
  latlng: {
    lat: number;
    lng: number;
  };
}

export const ServiceHubSchema = SchemaFactory.createForClass(ServiceHub);
