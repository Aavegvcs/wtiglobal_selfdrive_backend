import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDefined,
  IsObject,
  ValidateNested,
  IsArray
} from 'class-validator';
import { Type } from 'class-transformer';

class SpecsDto {
  @IsString()
  Class: string;

  @IsString()
  EngineCapacity: string;

  @IsNumber()
  MaxSpeed: number;

  @IsNumber()
  Doors: number;

  @IsNumber()
  Year: number;

  @IsString()
  PowerHP: string;

  @IsString()
  Transmission: string;

  @IsBoolean()
  IsSimilarCarsTitle: boolean;

  @IsBoolean()
  IsVerified: boolean;

  @IsBoolean()
  IsSimilarCars: boolean;

  @IsString()
  Model: string;

  @IsNumber()
  Seats: number;

  @IsString()
  Order_number: string;

  @IsString()
  DriveType: string;

  @IsString()
  ExteriorColor: string;

  @IsString()
  Manufactory: string;

  @IsString()
  BodyType: string;

  @IsOptional()
  @IsString()
  LuggageCapacity?: string;
}

class ImagesDto {
  @IsString()
  url_prefix: string;

  @IsArray()
  @IsString({ each: true })
  s3_paths: string[];
}

export class CreateVehicleDto {
  @IsDefined()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  vendor_id?: string;

  @IsDefined()
  @IsString()
  model_name: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => SpecsDto)
  specs: SpecsDto;

  @IsOptional()
  @IsNumber()
  vehicle_rating?: number;

  @IsOptional()
  @IsString()
  vehicle_promotion_tag?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => ImagesDto)
  images?: ImagesDto;
}
