import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProvisionalReservation, ProvisionalReservationSchema } from './schemas/provisional-reservation.schema';
import { ProvisionalReceipt, ProvisionalReceiptSchema } from './schemas/provisional-receipt.schema';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { Extras, ExtrasSchema } from '../extras/schemas/extras.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { FinalReservation, FinalReservationSchema } from './schemas/final-reservation.schema';
import { FinalReceipt, FinalReceiptSchema } from './schemas/final-receipt.schema';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ProvisionalReservation.name, schema: ProvisionalReservationSchema }]),
    MongooseModule.forFeature([{ name: ProvisionalReceipt.name, schema: ProvisionalReceiptSchema }]),
    MongooseModule.forFeature([{ name: Extras.name, schema: ExtrasSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: FinalReservation.name, schema: FinalReservationSchema }]),
    MongooseModule.forFeature([{ name: FinalReceipt.name, schema: FinalReceiptSchema }]),
    PaymentGatewayModule
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
