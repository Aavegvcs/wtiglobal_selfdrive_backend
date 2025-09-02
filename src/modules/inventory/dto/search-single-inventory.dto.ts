import {
  IsMongoId, IsNotEmpty, IsOptional, IsNumber, ValidateIf, IsString,
  ValidateNested, IsBoolean, IsIn
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// Optional: still useful elsewhere, but NOT needed if you keep @Transform below
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseJsonPipe implements PipeTransform {
  transform(value: unknown) {
    if (typeof value !== 'string') return value;
    try { return JSON.parse(value); }
    catch { throw new BadRequestException('Invalid JSON in query param.'); }
  }
}

export class LocationDto {
  @IsString() @IsNotEmpty()
  city: string;

  @IsMongoId()
  countryId: string;

  @IsString() @IsNotEmpty()
  countryCode: string;
}

export class DateTimeDto {
  @IsString() @IsNotEmpty()
  date: string; // "DD/MM/YYYY"

  @IsString() @IsNotEmpty()
  time: string; // "HH:mm"
}

export class SearchSinglePricingDto {
  @IsMongoId()
  vehicle_id: string;

  // Source
@Transform(({ obj }) => {
    const raw = obj?.drop;
    if (typeof raw === 'string' && raw.trim()) {
      try { return JSON.parse(raw); } catch {}
    }
    return raw;
  }, { toClassOnly: true })
@ValidateNested()
@Type(() => LocationDto)
@IsNotEmpty()
source: LocationDto;

// Pickup
@Transform(({ obj }) => {
    const raw = obj?.drop;
    if (typeof raw === 'string' && raw.trim()) {
      try { return JSON.parse(raw); } catch {}
    }
    return raw;
  }, { toClassOnly: true })
@ValidateNested()
@Type(() => DateTimeDto)
@IsNotEmpty()
pickup: DateTimeDto;

// Drop
@Transform(({ obj }) => {
    const raw = obj?.drop;
    if (typeof raw === 'string' && raw.trim()) {
      try { return JSON.parse(raw); } catch {}
    }
    return raw;
  }, { toClassOnly: true })
@ValidateNested()
@Type(() => DateTimeDto)
@IsNotEmpty()
drop: DateTimeDto;

  // 1 = daily/weekly, 2 = monthly
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsIn([1, 2])
  @IsNotEmpty()
  plan_type: number;

  // Only applicable for monthly (plan_type === 2)
  @ValidateIf(o => Number(o.plan_type) === 2)
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsNumber()
  @IsOptional()
  duration_months?: number;

  // Charges default to 0 when omitted
  @Transform(({ value }) => (value !== undefined ? Number(value) : 0))
  @IsNumber() @IsOptional()
  collection_charges?: number;

  @Transform(({ value }) => (value !== undefined ? Number(value) : 0))
  @IsNumber() @IsOptional()
  delivery_charges?: number;

  @Transform(({ value }) => (value !== undefined ? Number(value) : 0))
  @IsNumber() @IsOptional()
  extra_charges?: number;

  // Accept "true"/"false" or boolean
  @Transform(({ value }) => (typeof value === 'string' ? value === 'true' : !!value))
  @IsBoolean()
  @IsOptional()
  is_home_page?: boolean;

  @Transform(({ value }) => (typeof value === 'string' ? value === 'true' : !!value))
  @IsBoolean()
  @IsOptional()
  cdw?: boolean;

  @Transform(({ value }) => (typeof value === 'string' ? value === 'true' : !!value))
  @IsBoolean()
  @IsOptional()
  pai?: boolean;

  @Transform(({ value }) => (typeof value === 'string' ? value === 'true' : !!value))
  @IsBoolean()
  @IsOptional()
  security_deposit?: boolean;
}
