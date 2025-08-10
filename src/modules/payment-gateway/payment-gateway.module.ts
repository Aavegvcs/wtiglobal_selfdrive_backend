import { Module } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], 
  controllers: [],
  providers: [PaymentGatewayService],
  exports: [PaymentGatewayService],
})  
export class PaymentGatewayModule {}
