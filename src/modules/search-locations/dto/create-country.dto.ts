import { IsNotEmpty, IsString, IsBoolean } from 'class-validator';

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @IsBoolean()
  isActive: true;
}
