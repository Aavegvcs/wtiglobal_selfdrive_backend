import { IsEnum, IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { FaqType } from 'src/common/enums/faq-type.enum';

export class CreateFaqDto {

  @IsString()
  @IsOptional()
  id?: string;

  @IsEnum(FaqType)
  @IsNotEmpty()
  type: FaqType;

  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
