import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class WhatsappBookingDto {
  @IsString()
  @IsNotEmpty()
  contact: string;

  @IsString()
  @IsNotEmpty()
  contactCode: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  order_reference_number: string;

  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @IsString()
  @IsNotEmpty()
  tarrifType: string;

  @IsString()
  @IsNotEmpty()
  pickupDate: string;

  @IsString()
  @IsNotEmpty()
  dropDate: string;

  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @IsString()
  @IsNotEmpty()
  dropLocation: string;

  @IsString()
  @IsNotEmpty()
  vehicle: string;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsString()
  @IsOptional()
  extrasSelected: string;

  @IsNumber()
  baseFare: number;

  @IsNumber()
  addOns: number;

  @IsNumber()
  discount: number;

  @IsNumber()
  tax: number;

  @IsNumber()
  grandTotal: number;
}
