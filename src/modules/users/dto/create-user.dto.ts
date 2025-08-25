import { IsString, IsOptional, IsEnum, IsEmail, IsNumber, Matches } from 'class-validator';
import { Types } from 'mongoose';
import { GenderEnum } from '../schemas/user.schema';
import { UserRole } from 'src/common/enums/user-role.enum';
import { PlatformUsingEnum } from 'src/common/enums/platform-using.enum';
import { AuthTypeEnum } from 'src/common/enums/auth-type.enum';

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

  @IsString()
  @IsEnum(UserRole)
  userType: string;


  @IsOptional()
  @IsEnum(AuthTypeEnum)
  auth_type: string;

  @IsString()
  @IsEnum(PlatformUsingEnum)
  platform_using: string;
}