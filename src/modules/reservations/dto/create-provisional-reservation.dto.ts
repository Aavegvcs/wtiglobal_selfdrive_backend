import { IsString, IsNotEmpty, IsEnum, IsDate, IsMongoId, IsOptional, IsBoolean, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { Vehicle } from 'src/modules/vehicles/schemas/vehicle.schema';
import { PaymentType } from 'src/common/enums/payment-type.enum';
import { UserRole } from 'src/common/enums/user-role.enum';
import { TarrifType } from 'src/common/enums/tarrif-type.enum';
import { PaymentGatewayUsed } from 'src/common/enums/payment-gateway.enum';


export class CreateProvisionalReservationDto {
  @IsString()
  @IsNotEmpty()
  timezone: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsMongoId()
  @IsNotEmpty()
  search_id: string;


  @IsEnum(UserRole)
  userType: string;

  @IsEnum(TarrifType)
  tarrifType: string;

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
  pickupDate: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  dropDate: string;

  @IsNumber()
  @IsNotEmpty()
  durationDays: number;

  @IsMongoId()
  @IsNotEmpty()
  vehicle_id: string | Vehicle;

  @IsString()
  @IsNotEmpty()
  model_name: string;

  // @IsString()
  // @IsNotEmpty()
  // sku_id: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  extrasSelected?: string[];

  @IsEnum(PaymentType)
  @IsNotEmpty()
  paymentType: string;

  @IsEnum(PaymentGatewayUsed)
  @IsNotEmpty() // 0 for stripe, 1 for razorpay
  paymentGatewayUsed: string;

  @IsOptional()
  @IsArray()
  user_documents_id: string[];
}
