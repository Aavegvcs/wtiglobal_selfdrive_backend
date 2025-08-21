import { IsString, IsNotEmpty, IsEnum, IsDate, IsMongoId, IsOptional, IsBoolean, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Vehicle } from 'src/modules/vehicles/schemas/vehicle.schema';
import { PaymentType } from 'src/common/enums/payment-type.enum';
import { UserRole } from 'src/common/enums/user-role.enum';
import { RentalType } from 'src/common/enums/rental-type.enum';
import { PaymentGatewayUsed } from 'src/common/enums/payment-gateway.enum';

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

  @IsEnum(UserRole)
  userType: string;

  @IsEnum(RentalType)
  rentalType: string;

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

  @IsEnum(PaymentType)
  @IsNotEmpty()
  paymentType: string;

  @IsOptional()
  @IsString()
  razorpayOrderId?: string;

  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @IsString()
  @IsOptional()
  paymentId: string;

  @IsOptional()
  @IsString()
  finalPaymentId?: string;

  @IsEnum(PaymentGatewayUsed)
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
