import { IsString, IsOptional, IsEnum, IsEmail, IsNumber, Matches } from 'class-validator';
import { Types } from 'mongoose';
import { GenderEnum } from '../schemas/user.schema';
import { UserRole } from 'src/common/enums/user-role.enum';
import { PlatformUsingEnum } from 'src/common/enums/platform-using.enum';
import { AuthTypeEnum } from 'src/common/enums/auth-type.enum';
import { Transform } from 'class-transformer';

export class LoginDto {
  @IsString()
  userCred: any;

  @IsString() // Matches work with string
  @Matches(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' })
  otp: number
}

export class CreateUserDto {

  @IsString()
  firstName: string;

  @IsString()
  contact: string;

  @IsString()
  contactCode?: string;

  @IsEmail()
  emailID: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  profileImg?: string;

  @IsOptional()
  @IsString()
  stateName?: string;

  @IsString()
  @IsEnum(UserRole)
  userType: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  @IsEnum(GenderEnum)
  @Transform(({ value }) => value || GenderEnum.MALE) // Default if not provided
  gender: GenderEnum = GenderEnum.UNKNOWN;

  @IsString()
  @IsOptional()
  countryName: string;


  @IsOptional()
  @IsEnum(AuthTypeEnum)
  auth_type: string;

  @IsString()
  @IsEnum(PlatformUsingEnum)
  platform_using: string;
}