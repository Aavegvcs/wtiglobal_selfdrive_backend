import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum GenderEnum {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  UNKNOWN = 'UNKNOWN',
  TRANSGENDER = 'TRANSGENDER',
  OTHERS = 'OTHERS',
}

export enum UserTypeEnum {
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR',
  TRAVEL_AGENT = 'TRAVEL AGENT',
  SUBVENDOR = 'SUBVENDOR',
}

export enum AuthTypeEnum {
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
  WTI = 'WTI',
}

export enum ServiceUsingEnum {
  SELF_DRIVE = 'SELF_DRIVE',
  CHAUFFEUR = 'CHAUFFEUR',
}

export enum PlatformUsingEnum {
  APP = 'APP',
  WEB = 'WEB',
}

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'master users' })
export class User extends Document {
  @Prop({ unique: true, required: true })
  userID: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ trim: true })
  lastName?: string;

  @Prop({ trim: true })
  profileImg?: string;

  @Prop({ required: true })
  contact: number;

  @Prop({ default: '91' })
  contactCode: string;

  @Prop({ enum: GenderEnum, default: GenderEnum.UNKNOWN })
  gender: GenderEnum;

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

  @Prop({ enum: UserTypeEnum, default: UserTypeEnum.CUSTOMER })
  userType: UserTypeEnum;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'couponCodes' }], default: [] })
  couponCodesUsed: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'offers' }], default: [] })
  offersUsed: Types.ObjectId[];

  @Prop({
    type: {
      code: { type: Number, default: 0 },
      otpExpiry: {
        type: Date,
        default: () => new Date(Date.now() + 5 * 60 * 1000),
      },
    },
  })
  otp: {
    code: number | null;
    otpExpiry: Date | null;
  };

  @Prop({ default: null })
  refreshToken?: string;

  @Prop({ enum: AuthTypeEnum, default: AuthTypeEnum.WTI })
  auth_type: AuthTypeEnum;

  @Prop({ type: Boolean, default: false })
  documents_collected: boolean;

  @Prop({
    type: {
      service_using: {
        type: String,
        enum: ServiceUsingEnum,
        default: ServiceUsingEnum.CHAUFFEUR,
      },
      platform_using: {
        type: String,
        enum: PlatformUsingEnum,
        default: PlatformUsingEnum.WEB,
      },
    },
  })
  user_from: {
    service_using: ServiceUsingEnum;
    platform_using: PlatformUsingEnum;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);
