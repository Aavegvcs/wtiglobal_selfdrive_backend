import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { ProvisionalReceipt } from './provisional-receipt.schema';
import { Extras } from 'src/modules/extras/schemas/extras.schema';
import { Vehicle } from 'src/modules/vehicles/schemas/vehicle.schema';

@Schema({ timestamps: true, collection: 'sd_provisional_reservations' })
export class ProvisionalReservation extends Document {
  @Prop({ required: true })
  timezone: string;

  @Prop({ required: true })
  countryName: string;

  @Prop({ type: Types.ObjectId, ref: "searchmodel", required: true })
  search_id: string;

  @Prop({ required: true })
  order_reference_number: string;

  @Prop({ type: Types.ObjectId, ref: ProvisionalReceipt.name, required: true })
  receipt_ref_id: string;

  @Prop() 
  invoice_id: string;

  @Prop({ enum:["CUSTOMER", "TA"], default: "CUSTOMER" })
  userType: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user_id: Types.ObjectId;

  @Prop({ enum: ["WTI"], default: "WTI" })
  partnerName: string;

  @Prop({ required: true })
  pickupLocation: string;

  @Prop({ required: true })
  dropLocation: string;

  @Prop({ required: true })
  pickupDate: Date;

  @Prop({ required: true })
  dropDate: Date;

  @Prop({ required: true })
  durationDays: number;

  @Prop({ type: Types.ObjectId, required: true, ref: Vehicle.name })
  vehicle_id: Types.ObjectId;

  @Prop({ required: true })
  sku_id: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: Extras.name }],
    default: [],
  })
  extrasSelected: Types.ObjectId[];

  @Prop({ default: "HOLD" })
  reservationStatus: string;

  @Prop({ enum: ["FULL", "REFUND", "PART"], required: true })
  paymentType: string;

  @Prop({ default: null })
  razorpayOrderId: string;

  @Prop({ default: null })
  stripeCustomerId: string;

  @Prop({ required: true })
  paymentId: string;

  @Prop({ default: null })
  finalPaymentId: string;

  @Prop({ enum: ["0", "1"], required: true }) // 0 for stripe, 1 for razorpay
  paymentGatewayUsed: string;

  @Prop({
    type: {
      discountType: {type: String, default: null},
      discountId: {type: Types.ObjectId, default: null},
    },
  })
  discount: {
    discountType: string;
    discountId: Types.ObjectId;
  }
  
  @Prop() isModifiedFlag: boolean;
  @Prop() user_documents_id: string;
  @Prop() feedback_collected: boolean;
}

export const ProvisionalReservationSchema = SchemaFactory.createForClass(ProvisionalReservation);
