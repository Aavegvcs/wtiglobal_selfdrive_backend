import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  ValidateIf,
  IsString,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsMongoId()
  countryId: string;

  @IsString()
  @IsNotEmpty()
  countryCode: string;
}

class DateTimeDto {
  @IsString()
  @IsNotEmpty()
  date: string; // "DD/MM/YYYY"

  @IsString()
  @IsNotEmpty()
  time: string; // "HH:mm"
}

export class SearchPricingDto {
  @ValidateNested()
  @Type(() => LocationDto)
  @IsNotEmpty()
  source: LocationDto;

  @ValidateNested()
  @Type(() => DateTimeDto)
  @IsNotEmpty()
  pickup: DateTimeDto;

  @ValidateNested()
  @Type(() => DateTimeDto)
  @IsNotEmpty()
  drop: DateTimeDto;

  @ValidateIf((o) => o.plan_type === 3) // 3 for monthly
  @IsNumber()
  @IsOptional()
  duration_months: number;

  @IsNumber()
  @IsNotEmpty()
  plan_type: number; // 1 = daily, 2 = weekly, 3 = monthly

  @IsString()
  @IsNotEmpty()
  vehicle_class: string;
}
