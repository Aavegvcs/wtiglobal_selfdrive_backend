import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CancelReservationDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  id: string;

  @IsNotEmpty()
  @IsString()
  cancellation_reason: string;

  @IsNotEmpty()
  @IsString()
  cancelled_by: string;

}
