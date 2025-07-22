import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'master_users' })
export class User {
  @Prop({ required: true, unique: true })
  userID: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ trim: true, default: null })
  lastName?: string;

  @Prop({ trim: true , default: null})
  profileImg?: string;

  @Prop({ required: true })
  contact: string;

  @Prop({ default: '91' })
  contactCode: string;

  @Prop({ enum: ['MALE', 'FEMALE', 'OTHERS'], default: 'OTHERS' })
  gender: string;

  @Prop({ required: true, trim: true })
  countryName: string;

  @Prop({ trim: true })
  stateName?: string;

  @Prop({ trim: true, default: null })
  address?: string;

  @Prop({ trim: true, default: null })
  city?: string;

  @Prop({ default: null })
  postalCode?: string;

  @Prop({ required: true, trim: true })
  emailID: string;

  @Prop({ trim: true, default: null })
  password?: string;

  @Prop({ enum: ['CUSTOMER', 'VENDOR', 'TA'], default: 'CUSTOMER' })
  userType: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'couponCodes' }], default: [] })
  couponCodesUsed: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'offers' }], default: [] })
  offersUsed: Types.ObjectId[];

  @Prop({
    type: {
      code: { type: Number, default: null },
      otpExpiry: {
        type: Date,
        default: () => new Date(Date.now() + 5 * 60 * 1000),
      },
    },
    _id: false,
  })
  otp: {
    code: number | null;
    otpExpiry: Date | null;
  };

  @Prop({ enum: ['GOOGLE', 'APPLE', 'WTI'], default: 'WTI' })
  auth_type: string;

  @Prop({default: false})
  documents_collected: Boolean
}

export const UserSchema = SchemaFactory.createForClass(User);
