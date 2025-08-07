import { Type } from 'class-transformer';
import { ValidateNested, IsNotEmpty, IsObject } from 'class-validator';
import { CreateProvisionalReservationDto } from './create-provisional-reservation.dto';
import { CreateProvisionalReceiptDto } from './create-provisional-receipt.dto';

export class WrapperReservationDto {
  @ValidateNested()
  @Type(() => CreateProvisionalReservationDto)
  @IsObject()
  @IsNotEmpty()
  reservation: CreateProvisionalReservationDto;

  @ValidateNested()
  @Type(() => CreateProvisionalReceiptDto)
  @IsObject()
  @IsNotEmpty()
  receipt: CreateProvisionalReceiptDto;
}
