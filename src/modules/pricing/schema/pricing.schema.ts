import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PricingDocument = Pricing & Document;

@Schema({ timestamps: true, collection: 'sd_vehicle_pricings' }) // adds createdAt and updatedAt
export class Pricing {
  @Prop({ type: Types.ObjectId, ref: 'countries', required: true })
  country_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicle_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vendor', required: false })
  vendor_id: Types.ObjectId;

  @Prop({
    type: {
      base: Number,
      mileage_limit: Number,
      is_mileage_unlimited: Boolean,
      partial_security_deposit: Number,
      hikePercentage: Number,
    },
    _id: false,
  })
  tariff_daily: {
    base: number;
    mileage_limit: Number,
    is_mileage_unlimited: Boolean,
    partial_security_deposit: Number,
    hikePercentage: number;
  };

  @Prop({
    type: {
      base: Number,
      mileage_limit: Number,
      is_mileage_unlimited: Boolean,
      partial_security_deposit: Number,
      hikePercentage: Number,
    },
    _id: false,
  })
  tariff_weekly: {
    base: number;
    mileage_limit: Number,
    is_mileage_unlimited: Boolean,
    partial_security_deposit: Number,
    hikePercentage: number;
  };

  @Prop([{
    duration: Number,
    base: Number,
    mileage_limit: Number,
    is_mileage_unlimited: Boolean,
    partial_security_deposit: Number,
    hikePercentage: Number,
    _id: false
  }])
  tariff_monthly: {
    duration: number;
    base: number;
    mileage_limit: Number,
    is_mileage_unlimited: Boolean,
    partial_security_deposit: Number,
    hikePercentage: number;
  }[];

  @Prop()
  minimumRentalDays: number;

  @Prop()
  currency: string;

  @Prop()
  discount_percentage: number;

  @Prop()
  overrun_cost_per_km: number;

  @Prop()
  insurance_charge: number;

  @Prop({
    type: {
      daily: Number,
      weekly: Number,
      monthly: Number
    },
    _id: false
  })
  security_deposit_premium: {
    daily: number;
    weekly: number;
    monthly: number;
  };

  @Prop()
  total_security_deposit: number;

  @Prop({
    type: {
      daily: Number,
      weekly: Number,
      monthly: Number
    },
    _id: false
  })
  collision_damage_waiver: {
    daily: number;
    weekly: number;
    monthly: number;
  };

  @Prop({
    type: {
      daily: Number,
      weekly: Number,
      monthly: Number
    },
    _id: false
  })
  personal_accidental_insurance: {
    daily: number;
    weekly: number;
    monthly: number;
  };

  @Prop()
  onDemand: boolean;

  @Prop()
  isActive: boolean;
}

export const PricingSchema = SchemaFactory.createForClass(Pricing);
