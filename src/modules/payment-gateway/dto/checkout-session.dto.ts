import { IsNumber, IsString } from 'class-validator';

export class CheckoutSessionDto {
  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  customerId: string;

  @IsString()
  order_reference_number: string;

  @IsString()
  receiptId: string;

  @IsString()
  userType: string;
}
