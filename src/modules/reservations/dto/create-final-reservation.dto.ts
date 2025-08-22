import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RentalType } from 'src/common/enums/rental-type.enum';

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
