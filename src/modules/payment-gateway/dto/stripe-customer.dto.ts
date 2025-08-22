import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  line1: string;

  @IsString()
  @IsNotEmpty()
  postal_code: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

export class StripeCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsPhoneNumber()
  phone: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  address: AddressDto;
}
