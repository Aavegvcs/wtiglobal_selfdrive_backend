import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactUsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  contact: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  slug?: string;
}
