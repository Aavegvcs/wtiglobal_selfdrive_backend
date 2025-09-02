import {
  IsMongoId,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  ValidateNested,
  IsArray
} from 'class-validator';
import { Type } from 'class-transformer';

class TariffBase {
  @IsNumber()
  base: number;

  @IsNumber()
  mileage_limit: number;

  @IsBoolean()
  is_mileage_unlimited: boolean;

  @IsNumber()
  partial_security_deposit: number;

  @IsNumber()
  hikePercentage: number;
}

class MonthlyTariff {
  @IsNumber()
  duration: number;

  @IsNumber()
  base: number;

  @IsNumber()
  mileage_limit: number;

  @IsBoolean()
  is_mileage_unlimited: boolean;

  @IsNumber()
  partial_security_deposit: number;

  @IsNumber()
  hikePercentage: number;
}

class securityDepositPremium {
  @IsNumber()
  daily: number;

  @IsNumber()
  weekly: number;

  @IsNumber()
  monthly: number;
}

class collisionDamageWaiver {
  @IsNumber()
  daily: number;

  @IsNumber()
  weekly: number;

  @IsNumber()
  monthly: number;
}

class personalAccidentalInsurance {
  @IsNumber()
  daily: number;

  @IsNumber()
  weekly: number;

  @IsNumber()
  monthly: number;
}

export class CreatePricingDto {
  @IsMongoId()
  country_id: string;
  
  @IsMongoId()
  vehicle_id: string;

  @IsMongoId()
  @IsOptional()
  vendor_id?: string;

  @ValidateNested()
  @Type(() => TariffBase)
  tariff_daily: TariffBase;

  @ValidateNested()
  @Type(() => TariffBase)
  tariff_weekly: TariffBase;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MonthlyTariff)
  tariff_monthly: MonthlyTariff[];

  @IsNumber()
  minimumRentalDays: number;

  @IsString()
  currency: string;

  @IsNumber()
  discount_percentage: number;

  @IsNumber()
  overrun_cost_per_km: number;

  @IsNumber()
  insurance_charge: number;

  @ValidateNested()
  @Type(() => securityDepositPremium)
  security_deposit_premium: securityDepositPremium;

  @IsNumber()
  total_security_deposit: number;

  @ValidateNested()
  @Type(() => collisionDamageWaiver)
  collision_damage_waiver: collisionDamageWaiver;

  @ValidateNested()
  @Type(() => personalAccidentalInsurance)
  personal_accidental_insurance: personalAccidentalInsurance;

  @IsBoolean()
  onDemand: boolean;

  @IsBoolean()
  isActive: boolean;
}
