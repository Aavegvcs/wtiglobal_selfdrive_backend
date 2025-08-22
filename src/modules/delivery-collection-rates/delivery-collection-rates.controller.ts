import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { CreateDeliveryCollectionRateDto } from "./dto/create-delivery-collection-rates.dto";
import { DeliveryCollectionRatesService } from "./delivery-collection-rates.service";


@Controller('delivery-collection-rates')
export class DeliveryCollectionRatesController {
    constructor(private readonly deliveryCollectionRatesService: DeliveryCollectionRatesService){}

    @Post('createUpdateDeliveryCollectionRates')
    createUpdateDeliveryCollectionRates(@Body() deliveryCollectionDto: CreateDeliveryCollectionRateDto) {
        return this.deliveryCollectionRatesService.createUpdateDeliveryCollectionRates(deliveryCollectionDto)
    }

    @Get('getDeliveryCollectionRatesOnCity/:country/:city')
    getDeliveryCollectionRatesOnCity(
        @Param('country') country: string,
        @Param('city') city: string
    ){
        return this.deliveryCollectionRatesService.getDeliveryCollectionRatesOnCity(country, city)
    }

    @Get('getDeliveryCollectionRatesOnCountry/:country')
    getDeliveryCollectionRatesOnCountry(@Param('country') country: string){
        return this.deliveryCollectionRatesService.getDeliveryCollectionRatesOnCountry(country)
    }


}