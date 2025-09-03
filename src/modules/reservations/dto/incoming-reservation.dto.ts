import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { PaymentType } from 'src/common/enums/payment-type.enum';
import { UserRole } from 'src/common/enums/user-role.enum';

export class IncomingReservationDto {
  @IsString()
  @IsNotEmpty()
  reqResId: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(UserRole)
  userType: string; 

  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  extrasSelected?: string[];

  @IsString()
  @IsNotEmpty()
  @IsEnum(PaymentType)
  paymentType: string; // could also be restricted with an enum

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  user_documents_id?: string[];

  @IsNumber()
  @IsNotEmpty()
  currencyRate: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsNotEmpty()
  selectedTarrif: string;
}
