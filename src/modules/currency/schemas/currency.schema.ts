import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false, timestamps: true, collection: "currencies" }) 
export class Currency extends Document {
  @Prop({ type: Object }) // you had currencies: {} in plain Mongoose
  currencies: Record<string, any>;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);
