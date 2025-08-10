import { IsString, IsNotEmpty, IsEnum, IsDate, IsMongoId, IsOptional, IsBoolean, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Vehicle } from 'src/modules/vehicles/schemas/vehicle.schema';
import { Types } from 'mongoose';

export class DiscountDto {
  @IsOptional()
  @IsString()
  discountType: string;

  @IsOptional()
  @IsMongoId()
  discountId: string;
}

export class CreateProvisionalReservationDto {
  @IsString()
  @IsNotEmpty()
  timezone: string;

  @IsString()
  @IsNotEmpty()
  countryName: string;

  @IsMongoId()
  @IsNotEmpty()
  search_id: string;


  @IsOptional()
  @IsString()
  invoice_id?: string;

  @IsEnum(['CUSTOMER', 'TA'])
  userType: string;

  @IsMongoId()
  @IsNotEmpty()
  user_id: string;

  @IsOptional()
  @IsEnum(['WTI'])
  partnerName?: string;

  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @IsString()
  @IsNotEmpty()
  dropLocation: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  pickupDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dropDate: Date;

  @IsNumber()
  @IsNotEmpty()
  durationDays: number;

  @IsMongoId()
  @IsNotEmpty()
  vehicle_id: string | Vehicle;

  @IsString()
  @IsNotEmpty()
  sku_id: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  extrasSelected?: string[];

  @IsString()
  reservationStatus?: string;

  @IsEnum(['FULL', 'REFUND', 'PART'])
  @IsNotEmpty()
  paymentType: string;

  @IsOptional()
  @IsString()
  razorpayOrderId?: string;

  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @IsString()
  paymentId: string;

  @IsOptional()
  @IsString()
  finalPaymentId?: string;

  @IsEnum(['0', '1'])
  @IsNotEmpty() // 0 for stripe, 1 for razorpay
  paymentGatewayUsed: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DiscountDto)
  discount?: DiscountDto;

  @IsOptional()
  @IsBoolean()
  isModifiedFlag?: boolean;

  @IsOptional()
  @IsString()
  user_documents_id?: string;

  @IsOptional()
  @IsBoolean()
  feedback_collected?: boolean;
}
