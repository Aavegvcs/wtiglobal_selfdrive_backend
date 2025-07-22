import { IsString, IsOptional, IsEnum, IsEmail, IsNumber, Matches } from 'class-validator';
import { Types } from 'mongoose';

export class LoginDto {
  @IsString()
  userCred: string;

  @IsString() // Matches work with string
  @Matches(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' })
  otp: number
}

export class CreateUserDto {
  @IsString()
  @IsOptional()
  userID: string;

  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  profileImg?: string;

  @IsString()
  contact: string;

  @IsOptional()
  @IsString()
  contactCode?: string;

  @IsString()
  @IsEnum(['MALE', 'FEMALE', 'UNKNOWN', 'TRANSGENDER', 'OTHERS'])
  gender?: string;

  @IsString()
  countryName: string;

  @IsOptional()
  @IsString()
  stateName?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsEmail()
  emailID: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsEnum(['CUSTOMER', 'VENDOR', 'TRAVEL AGENT', 'SUBVENDOR'])
  userType?: string;

  @IsOptional()
  couponCodesUsed?: Types.ObjectId[];

  @IsOptional()
  offersUsed?: Types.ObjectId[];

  @IsOptional()
  otp?: {
    code: number;
    otpExpiry: Date;
  };

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @IsOptional()
  @IsEnum(['GOOGLE', 'APPLE', 'WTI'])
  auth_type?: string;
}