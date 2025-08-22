import { Module } from '@nestjs/common';
import { StripeWebhookService } from './stripe-webhook.service';
import { ReservationModule } from '../reservations/reservation.module';
import { StripeWebhookController } from './stripe-webhook.controller';

@Module({
  imports: [ReservationModule],
  controllers: [StripeWebhookController],
  providers: [StripeWebhookService],
})
export class WebhookModule {}
