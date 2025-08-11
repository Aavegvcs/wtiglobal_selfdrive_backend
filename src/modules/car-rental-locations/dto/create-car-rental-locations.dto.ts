import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCarRentalLocationDto {

  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @IsOptional()
  cityName?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  image: string;
}
