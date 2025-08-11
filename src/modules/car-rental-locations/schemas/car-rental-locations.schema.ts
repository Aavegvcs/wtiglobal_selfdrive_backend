import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export type CarRentalLocationDocument = CarRentalLocation & Document;

@Schema({ timestamps: true, collection: 'sd_car_rental_locations' })
export class CarRentalLocation {
  @Prop({ required: true })
  countryCode: string;

  @Prop({ type: String, default: null })
  cityName: string | null;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: "" })
  slug: string;

  @Prop({ required: true })
  image: string;

}

export const CarRentalLocationSchema = SchemaFactory.createForClass(CarRentalLocation);