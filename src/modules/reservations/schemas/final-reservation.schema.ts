import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/modules/users/schemas/user.schema';
import { FinalReceipt } from './final-receipt.schema';
import { Extras } from 'src/modules/extras/schemas/extras.schema';
import { Vehicle } from 'src/modules/vehicles/schemas/vehicle.schema';
import { ReservationStatusEnum } from 'src/common/enums/reservation-status.enum';
import { PaymentType } from 'src/common/enums/payment-type.enum';
import { PaymentGatewayUsed } from 'src/common/enums/payment-gateway.enum';
import { UserRole } from 'src/common/enums/user-role.enum';
import { PartnerName } from 'src/common/enums/partner-name.enum';
import { TarrifType } from 'src/common/enums/tarrif-type.enum';

@Schema({ timestamps: true, collection: 'sd_final_reservations' })
export class FinalReservation extends Document {
  @Prop({ required: true })
  timezone: string;

  @Prop({ required: true })
  country: string;

  @Prop({ type: Types.ObjectId, ref: "searchmodel", required: true })
  search_id: string;

  @Prop({ required: true })
  order_reference_number: string;

  @Prop({ type: Types.ObjectId, ref: FinalReceipt.name, required: true })
  receipt_ref_id: string;

  @Prop() 
  invoice_id: string;

  @Prop({ enum: UserRole, default: UserRole.CUSTOMER })
  userType: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user_id: Types.ObjectId | User;

  @Prop({ enum: PartnerName, default: PartnerName.WTI })
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

  @Prop({ enum : TarrifType, required: true})
  tarrifType: string

  @Prop({ type: Types.ObjectId, required: true, ref: Vehicle.name })
  vehicle_id: Types.ObjectId | Vehicle;

  @Prop({ type: String, required: true })
  model_name: string;

  @Prop({ type: String, required: true })
  sku_id: string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: Extras.name }],
    default: [],
  })
  extrasSelected: Types.ObjectId[];

  @Prop({ enum: ReservationStatusEnum, default: ReservationStatusEnum.CONFIRMED })
  reservationStatus: string;

  @Prop({ enum: PaymentType, required: true })
  paymentType: string;

  @Prop({ default: null })
  razorpayOrderId: string;

  @Prop({ default: null })
  stripeCustomerId: string;

  @Prop({ required: true })
  paymentId: string;

  @Prop({ default: null })
  finalPaymentId: string;

  @Prop({ enum: PaymentGatewayUsed, required: true }) // 0 for stripe, 1 for razorpay
  paymentGatewayUsed: string;
  
  @Prop({default: false}) isModifiedFlag: boolean;

  @Prop({ type: Types.ObjectId, each: true, default: [] }) 
  user_documents_id: Types.ObjectId[];
  
  @Prop() feedback_collected: boolean;
  @Prop() cancellation_reason: string;
  @Prop() cancelled_by: string;
  @Prop() cancel_time: Date;
}

export const FinalReservationSchema = SchemaFactory.createForClass(FinalReservation);
