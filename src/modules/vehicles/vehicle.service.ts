import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument } from './schemas/vehicle.schema';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { standardResponse } from 'src/common/helpers/response.helper';


@Injectable()
export class VehicleService {
  constructor(@InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>) {}

  // ✅ Create or Update Vehicle
  async createOrUpdateVehicle(dto: CreateVehicleDto): Promise<any> {
    try {
      const existingVehicle = await this.vehicleModel.findOne({ id: dto.id });

      if (existingVehicle) {
        const updated = await this.vehicleModel.findOneAndUpdate({ id: dto.id }, dto, {
          new: true,
        });

        if (updated) {
          return standardResponse(
            true,
            'Vehicle data updated successfully',
            200,
            { vehicleUpdated: true, vehicleAdded: false },
            null,
            '/vehicle/createOrUpdateVehicle'
          );
        }

        return standardResponse(
          false,
          'Unable to update vehicle data',
          400,
          { vehicleUpdated: false, vehicleAdded: false },
          null,
          '/vehicle/createOrUpdateVehicle'
        );
      }

      const created = new this.vehicleModel(dto);
      await created.save();

      return standardResponse(
        true,
        'New vehicle data added successfully',
        200,
        { vehicleUpdated: false, vehicleAdded: true },
        null,
        '/vehicle/createOrUpdateVehicle'
      );
    } catch (error) {
      return standardResponse(
        false,
        'Internal server error',
        500,
        null,
        error,
        '/vehicle/createOrUpdateVehicle'
      );
    }
  }

  // ✅ Get all active vehicles
  async findAllVehicles(): Promise<any> {
    try {
      const vehicles = await this.vehicleModel.find({ isActive: true }).exec();

      return standardResponse(
        true,
        'Active vehicles fetched successfully',
        200,
        { data: vehicles },
        null,
        '/vehicle/findAllVehicles'
      );
    } catch (error) {
      return standardResponse(
        false,
        'Internal server error',
        500,
        null,
        error,
        '/vehicle/findAllVehicles'
      );
    }
  }

  // ✅ Get single active vehicle by ID
  async findVehicleById(id: string): Promise<any> {
    try {
      const vehicle = await this.vehicleModel.findOne({ id, isActive: true }).exec();

      if (!vehicle) {
        return standardResponse(
          false,
          'Active vehicle not found',
          404,
          null,
          null,
          '/vehicle/findVehicleById'
        );
      }

      return standardResponse(
        true,
        'Active vehicle fetched successfully',
        200,
        { data: vehicle },
        null,
        '/vehicle/findVehicleById'
      );
    } catch (error) {
      return standardResponse(
        false,
        'Internal server error',
        500,
        null,
        error,
        '/vehicle/findVehicleById'
      );
    }
  }

  // ✅ Delete vehicle by ID
  async removeVehicle(id: string): Promise<any> {
    try {
      const result = await this.vehicleModel.deleteOne({ id }).exec();

      if (result.deletedCount === 0) {
        return standardResponse(
          false,
          'Vehicle not found',
          404,
          null,
          null,
          '/vehicle/removeVehicle'
        );
      }

      return standardResponse(
        true,
        'Vehicle deleted successfully',
        200,
        null,
        null,
        '/vehicle/removeVehicle'
      );
    } catch (error) {
      return standardResponse(
        false,
        'Internal server error',
        500,
        null,
        error,
        '/vehicle/removeVehicle'
      );
    }
  }
}
