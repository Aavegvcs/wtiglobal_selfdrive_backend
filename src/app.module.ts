import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehicleModule } from './modules/vehicles/vehicles.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { SearchLocationModule } from './modules/search-locations/search-locations.module';
import { ReservationModule } from './modules/reservations/reservation.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CarRentalLocationsModule } from './modules/car-rental-locations/car-rental-locations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: [
      `.env.${process.env.NODE_ENV}`, // first priority
      '.env'                          // fallback
    ],
     }), // loads `.env` file globally
    
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        dbName: configService.get<string>('MONGO_DBNAME'),
      }),
      inject: [ConfigService],
    }),

    VehicleModule,
    UsersModule,
    WhatsappModule,
    SearchLocationModule,
    ReservationModule,
    PricingModule,
    InventoryModule,
    CarRentalLocationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
