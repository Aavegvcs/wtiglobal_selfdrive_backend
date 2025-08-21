import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  ValidateNested,
  IsArray,
  IsNotEmpty
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from 'src/common/enums/payment-method-type.enum';

class CurrencyInfoDto {
  @IsString()
  currency: string;

  @IsNumber()
  currencyRate: number;
}

class FineAndTollDto {
  @IsString()
  fine_type: string;

  @IsNumber()
  fine_amount: number;

  @IsString()
  @IsOptional()
  fineDescription?: string;

  @IsString()
  @IsOptional()
  fineImage?: string;
}

export class CreateProvisionalReceiptDto {

  @IsNumber()
  @IsNotEmpty()
  baseFare: number;

  @IsNumber()
  @IsOptional()
  totalTax?: number;

  @IsNumber()
  @IsOptional()
  addOns?: number;

  @IsNumber()
  @IsOptional()
  insuranceCharge?: number;

  @IsNumber()
  @IsNotEmpty()
  securityDeposit?: number;

  @IsNumber()
  @IsOptional()
  deliveryCharge?: number;

  @IsNumber()
  @IsOptional()
  collectionCharge?: number;

  @ValidateNested()
  @Type(() => CurrencyInfoDto)
  currencyInfo: CurrencyInfoDto;

  @IsNumber()
  @IsNotEmpty()
  totalFare: number;

  @IsNumber()
  @IsOptional()
  discount?: number;

  @IsNumber()
  @IsNotEmpty()
  actualFare: number;

  @IsNumber()
  @IsNotEmpty()
  amountPaid: number;

  @IsNumber()
  @IsOptional()
  actual_amount_collected?: number;

  @IsNumber()
  @IsOptional()
  amount_to_be_collected?: number;

  @IsNumber()
  @IsOptional()
  part_payment_percentage?: number;

  @IsString()
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: string;

  @IsBoolean()
  @IsOptional()
  isModifiedFlag?: boolean;
}
