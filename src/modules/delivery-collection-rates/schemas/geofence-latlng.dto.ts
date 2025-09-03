import { IsNumber } from 'class-validator';

export class GeofenceLatLngDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;
}
