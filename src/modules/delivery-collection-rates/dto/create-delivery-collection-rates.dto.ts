import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsMongoId } from 'class-validator';

export class CreateDeliveryCollectionRateDto {
  @IsString()
  @IsOptional()
  id: string

  @IsString()
  @IsNotEmpty()
  country: string; // e.g., "India", "UK", "UAE"

  @IsString()
  @IsNotEmpty()
  city: string; // e.g., "Delhi", "London", "Dubai"

  // @IsMongoId()
  // @IsOptional()
  // vendorId?: string; // Optional, vendor-specific

  @IsNumber()
  @IsNotEmpty()
  deliveryFee: number; // Flat delivery charge

  @IsNumber()
  @IsNotEmpty()
  collectionFee: number; // Flat collection charge

  @IsString()
  @IsNotEmpty()
  currency: string; // e.g., "INR", "GBP", "AED"

}
