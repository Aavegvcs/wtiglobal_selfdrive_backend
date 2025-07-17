import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';


@Injectable()
export class VehicleService {
  constructor(@InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>) {}

  async createOrUpdateVehicle(dto: CreateVehicleDto): Promise<any> {
  const existingVehicle = await this.vehicleModel.findOne({ id: dto.id });

  if (existingVehicle) {
    // Update the existing vehicle
    return this.vehicleModel.findOneAndUpdate({ id: dto.id }, dto, {
      new: true,
    });
  }

  // Create a new vehicle
  const vehicle = new this.vehicleModel(dto);
  return vehicle.save();
}

  async findAllVehicles(): Promise<Vehicle[]> {
    return this.vehicleModel.find().exec();
  }

  async findVehicleById(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleModel.findOne({ id }).exec();
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async removeVehcle(id: string): Promise<{ message: string }> {
    const result = await this.vehicleModel.deleteOne({ id }).exec();
    if (result.deletedCount === 0) throw new NotFoundException('Vehicle not found');
    return { message: 'Vehicle deleted successfully' };
  }
}
