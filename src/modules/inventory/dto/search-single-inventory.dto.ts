import { Optional } from '@nestjs/common';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  ValidateIf
} from 'class-validator';

export class SearchSinglePricingDto {

  @IsMongoId()
  vehicle_id: string;

  @IsDateString({ strict: true })
  @IsNotEmpty()
  pickup_date: Date; // ISO string in UTC (e.g., "2025-07-29T10:00:00Z")

  @IsDateString({ strict: true })
  @IsOptional()
  drop_date: Date; // ISO string in UTC

  @ValidateIf((o) => o.plan_type === 'monthly')
  @IsNumber()
  @IsOptional()
  duration_months: number; // applicable only for monthly plans

  @IsNotEmpty()
  plan_type: 'daily' | 'weekly' | 'monthly'; // usage type to control logic
}


