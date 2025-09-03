import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'sd_delivery_collection_rates', timestamps: true })
export class DeliveryCollectionRate extends Document {
  @Prop({ required: true, trim: true })
  country: string;   // e.g., "India", "UK", "UAE"

  @Prop({ required: true, trim:true })
  city: string;      // e.g., "Delhi", "London", "Dubai"

//   @Prop({ type: Types.ObjectId, ref: 'Vendor' })
//   vendorId?: Types.ObjectId;  // optional, if vendor-specific

  @Prop({ required: true })
  rate: number; // Flat delivery/collection charge

  @Prop({ required: true, uppercase: true, trim: true })
  currency: string;      // e.g., "INR", "GBP", "AED"

}

export const DeliveryCollectionRateSchema = SchemaFactory.createForClass(DeliveryCollectionRate);
