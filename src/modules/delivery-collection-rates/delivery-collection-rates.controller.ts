import { Body, Controller, Get, Param, Post, Res } from "@nestjs/common";
import { CreateDeliveryCollectionRateDto } from "./dto/create-delivery-collection-rates.dto";
import { DeliveryCollectionRatesService } from "./delivery-collection-rates.service";
import { GeofenceLatLngDto } from "./schemas/geofence-latlng.dto";
import { Response } from "express";


@Controller('delivery-collection-rates')
export class DeliveryCollectionRatesController {
    constructor(private readonly deliveryCollectionRatesService: DeliveryCollectionRatesService){}

    @Post('createUpdateDeliveryCollectionRates')
    async createUpdateDeliveryCollectionRates(@Body() deliveryCollectionDto: CreateDeliveryCollectionRateDto, @Res() res: Response) {
        const response = await this.deliveryCollectionRatesService.createUpdateDeliveryCollectionRates(deliveryCollectionDto);
        return res.status(response.statusCode).json(response);
    }

    @Post('getDeliveryCollectionRates')
    async getDeliveryCollectionRates(@Body() latlng: GeofenceLatLngDto, @Res() res: Response){
        const response = await this.deliveryCollectionRatesService.getDeliveryCollectionRates(latlng);
        return res.status(response.statusCode).json(response);
    }

    @Get('getDeliveryCollectionRatesOnCountry/:country')
    async getDeliveryCollectionRatesOnCountry(@Param('country') country: string, @Res() res: Response){
        const response = await this.deliveryCollectionRatesService.getDeliveryCollectionRatesOnCountry(country);
        return res.status(response.statusCode).json(response);
    }

    @Get('getServiceHubByCountryAndCity/:countryCode/:city')
    async getServiceHubByCountryAndCity(@Param('countryCode') countryCode: string, @Param('city') city: string, @Res() res: Response){
        const response = await this.deliveryCollectionRatesService.getServiceHubByCountryAndCity(countryCode, city);
        return res.status(response.statusCode).json(response);
    }


}