import {
  IsNotEmpty,
  IsString,
} from 'class-validator';


export class vehicleClassDto {
  @IsString()
  @IsNotEmpty()
  imageUrl: String;

  @IsString()
  @IsNotEmpty()
  className: String;

}