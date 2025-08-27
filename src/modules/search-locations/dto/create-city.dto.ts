// dto/create-city.dto.ts
import { IsMongoId, IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class CreateCityDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  timezone: string;

  @IsMongoId()
  @IsNotEmpty()
  countryId: Types.ObjectId;

  @IsBoolean()
  isActive: boolean;
}
