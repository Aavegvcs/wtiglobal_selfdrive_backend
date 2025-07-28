import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Countries, CountrySchema } from './schemas/countries.schema';
import { Cities, CitySchema } from './schemas/cities.schema';
import { SearchLocationsController } from './search-locations.controller';
import { SearchLocationsService } from './search-locations.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Countries.name, schema: CountrySchema }]),
    MongooseModule.forFeature([{ name: Cities.name, schema: CitySchema }]),
  ],
  controllers: [SearchLocationsController],
  providers: [SearchLocationsService],
})
export class SearchLocationModule {}
