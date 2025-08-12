export class CreateVehicleDto {
  id: string;
  vendor_id?: string;
  model_name: string;
  specs: {
    Class: string;
    EngineCapacity: string;
    MaxSpeed: number;
    Doors: number;
    Year: number;
    PowerHP: string;
    Transmission: string;
    IsSimilarCarsTitle: boolean;
    IsVerified: boolean;
    IsSimilarCars: boolean;
    Model: string;
    Seats: number;
    Order_number: string;
    DriveType: string;
    ExteriorColor: string;
    Manufactory: string;
    BodyType: string;
  };
  vehicle_rating?: number;
  vehicle_promotion_tag?: String;
  isActive?: boolean;
  images?: {
    url_prefix: string;
    s3_paths: string[];
  };
}
