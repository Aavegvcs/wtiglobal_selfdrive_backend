import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCarRentalLocationDto } from './dto/create-car-rental-locations.dto';
import { CarRentalLocation, CarRentalLocationDocument } from './schemas/car-rental-locations.schema';
import { standardResponse } from 'src/common/helpers/response.helper';

@Injectable()
export class CarRentalLocationsService {
  constructor(
    @InjectModel(CarRentalLocation.name)
    private readonly locationModel: Model<CarRentalLocationDocument>,
  ) {}

  async createOrUpdateCarRentalLocation(dto: Partial<CreateCarRentalLocationDto>) {
    try {

        if (dto.id) {
        // UPDATE if ID is provided
        const location = await this.locationModel.findByIdAndUpdate(dto.id, dto, { new: true }).exec();
        if (!location) {
            return standardResponse(false, 'Location not found for update', 404, null, "/car-rental-locations/createOrUpdateCarRentalLocation");
        }
        return standardResponse(true, 'Location updated successfully', 200, location, null, "/car-rental-locations/createOrUpdateCarRentalLocation");
        } else {
        // CREATE if no ID
        const created = new this.locationModel(dto);
        await created.save();
        return standardResponse(true, 'Location created successfully', 201, created, null, "/car-rental-locations/createOrUpdateCarRentalLocation");
        }
    } catch (error) {
        return standardResponse(false, 'Internal Server Error', 500, null, error, "/car-rental-locations/createOrUpdateCarRentalLocation");
    }
  }

  async getAllCarRentalLocationsOnCountry(countryCode: string) {
    try {
      const locations = await this.locationModel.find({ countryCode }).exec();

      const responseData = {
        isActive: true,
        tagline: "Car Rental Locations Across the World",
        availableInCountries: ["UAE"],
        data: locations
      }
      return standardResponse(true, 'Locations fetched successfully', 200, responseData, null, "/car-rental-locations/getAllCarRentalLocationsOnCountry");
    } catch (error) {
      return standardResponse(false, 'Internal Server Error', 500, null, error.stack, "/car-rental-locations/getAllCarRentalLocationsOnCountry");
    }
  }

  async deleteCarRentalLocation(id: string) {
    try {
      const deleted = await this.locationModel.findByIdAndDelete(id).exec();
      if (!deleted) {
        return standardResponse(false, 'Location not found', 404, null, null, "/car-rental-locations/deleteCarRentalLocation");
      }
      return standardResponse(true, 'Location deleted successfully', 200, null, null, "/car-rental-locations/deleteCarRentalLocation");
    } catch (error) {
      return standardResponse(false, 'Internal Server Error', 500, null, error, "/car-rental-locations/deleteCarRentalLocation");
    }
  }
}
