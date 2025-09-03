import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CreateDeliveryCollectionRateDto } from "./dto/create-delivery-collection-rates.dto";
import { DeliveryCollectionRatesService } from "./delivery-collection-rates.service";
import { GeofenceLatLngDto } from "./schemas/geofence-latlng.dto";


@Controller('delivery-collection-rates')
export class DeliveryCollectionRatesController {
    constructor(private readonly deliveryCollectionRatesService: DeliveryCollectionRatesService){}

    @Post('createUpdateDeliveryCollectionRates')
    createUpdateDeliveryCollectionRates(@Body() deliveryCollectionDto: CreateDeliveryCollectionRateDto) {
        return this.deliveryCollectionRatesService.createUpdateDeliveryCollectionRates(deliveryCollectionDto)
    }

    @Post('getDeliveryCollectionRates')
    getDeliveryCollectionRates(@Body() latlng: GeofenceLatLngDto){
        return this.deliveryCollectionRatesService.getDeliveryCollectionRates(latlng)
    }

    @Get('getDeliveryCollectionRatesOnCountry/:country')
    getDeliveryCollectionRatesOnCountry(@Param('country') country: string){
        return this.deliveryCollectionRatesService.getDeliveryCollectionRatesOnCountry(country)
    }


}