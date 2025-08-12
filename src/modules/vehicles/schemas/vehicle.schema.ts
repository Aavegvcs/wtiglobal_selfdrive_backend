import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VehicleDocument = Vehicle & Document;


export enum VehiclePromotionTag {
  Popular = 'Popular',
  Trending = 'Trending',
  Best_Seller = 'Best Seller',
  NONE = '', // Optional default value for vehicles with no promotion
}


@Schema({ timestamps: true , collection: 'sd_master_vehicles' })
export class Vehicle {
  @Prop({ required: true })
  id: string;

  @Prop({ default:null })
  vendor_id: string;

  @Prop({ required: true })
  model_name: string;

  @Prop({
    type: {
      Class: { type: String },
      EngineCapacity: { type: String },
      MaxSpeed: { type: Number },
      Doors: { type: Number },
      Year: { type: Number },
      PowerHP: { type: String },
      Transmission: { type: String },
      IsSimilarCarsTitle: { type: Boolean },
      IsVerified: { type: Boolean },
      IsSimilarCars: { type: Boolean },
      Model: { type: String },
      Seats: { type: Number },
      Order_number: { type: String },
      DriveType: { type: String },
      ExteriorColor: { type: String },
      Manufactory: { type: String },
      BodyType: { type: String },
      LuggageCapacity: {type: String},
    },
    required: true,
  })
  specs: {
    Class: String;
    EngineCapacity: String;
    MaxSpeed: Number;
    Doors: Number;
    Year: Number;
    PowerHP: String;
    Transmission: String;
    IsSimilarCarsTitle: Boolean;
    IsVerified: Boolean;
    IsSimilarCars: Boolean;
    Model: String;
    Seats: Number;
    Order_number: String;
    DriveType: String;
    ExteriorColor: String;
    Manufactory: String;
    BodyType: String;
    LuggageCapacity: String;
  };

  @Prop({ type: Number, default: 0 })
  vehicle_rating: Number;

   @Prop({ type: String, enum: VehiclePromotionTag, default: VehiclePromotionTag.NONE })
  vehicle_promotion_tag?: VehiclePromotionTag;  

  @Prop({ default: true })
  isActive: Boolean;

  @Prop({
    type: {
      url_prefix: { type: String },
      s3_paths: { type: [String], default: [] },
    },
    required: false,
  })
  images: {
    url_prefix: String;
    s3_paths: String[];
  };
}

export const vehicleSchema = SchemaFactory.createForClass(Vehicle);
