import { IsOptional, IsString } from 'class-validator';

export class FinalReservationDto {
  @IsString()
  paymentId: string;

  @IsString()
  order_reference_number: string;

  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @IsOptional()
  @IsString()
  razorpayOrderId?: string;
}
