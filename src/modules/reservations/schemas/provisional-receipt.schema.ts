import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PaymentMethod } from 'src/common/enums/payment-method-type.enum';

@Schema({ timestamps: true, collection: 'sd_provisional_receipts' })
export class ProvisionalReceipt extends Document {
  @Prop({required: true}) 
  receiptId: string;

  @Prop({required: true}) 
  order_reference_number: string;

  @Prop({required: true}) 
  baseFare: number;

  @Prop({default: 0}) 
  totalTax: number;

  @Prop({default: 0}) 
  addOns: number;

  @Prop({default: 0}) 
  insuranceCharge: number;

  @Prop({default: 0}) 
  securityDeposit: number;

  @Prop({default: 0}) 
  deliveryCharge: number;

  @Prop({default: 0}) 
  collectionCharge: number;

  @Prop({enum: ['AED'], default: "AED"}) 
  baseCurrency: String;

  @Prop({
    type: {
      currency: {type: String, required: true},
      currencyRate: {type: Number, required: true},
    },
  })
  currencyInfo: {
    currency: string;
    currencyRate: number;
  };
  
  @Prop([
    {
      fine_type: String,
      fine_amount: Number,
      fineDescription: String,
      fineImage: String,
    },
  ])
  finesAndTolls: {
    fine_type: string;
    fine_amount: number;
    fineDescription: string;
    fineImage: string;
  }[];

  @Prop({required: true}) 
  totalFare: number;

  @Prop({default: 0}) 
  discount: number;

  @Prop({required: true}) 
  actualFare: number;

  @Prop({required: true}) 
  amountPaid: number;

  @Prop({default: 0}) 
  actual_amount_collected: number;

  @Prop({default: 0}) 
  amount_to_be_collected: number;

  @Prop({default: 20}) 
  part_payment_percentage: number;

  @Prop({enum: PaymentMethod, default: PaymentMethod.CARD}) 
  paymentMethod: string;

  @Prop({default: false}) isModifiedFlag: boolean;
}

export const ProvisionalReceiptSchema = SchemaFactory.createForClass(ProvisionalReceipt);
