import { IsNumber, IsString, IsOptional, IsObject } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsOptional()
  @IsObject()
  notes?: Record<string, any>;

  @IsString()
  receiptID: string;
}

