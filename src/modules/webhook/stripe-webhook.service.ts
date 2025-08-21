import { Injectable, Logger, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ReservationService } from '../reservations/reservation.service';

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name);

  constructor(private readonly reservationService: ReservationService){}

  async handleStripeEvent(event: any, ip: string) {
    let paymentObject: any;

    try {
      switch (event.type) {
        case 'payment_intent.succeeded': {
          this.logger.log(`Event type: ${event.type} triggered - ${ip}`);
          paymentObject = event.data.object;

          const {
            order_reference_number,
            userType = "CUSTOMER",
            stripe_customer_id,
            payment_phase,
          } = paymentObject.metadata;

          if(!order_reference_number || !stripe_customer_id){
            this.logger.error(`Missing order_reference_number: ${order_reference_number} or stripe_customer_id: ${stripe_customer_id}`);
            return {
                success: false,
                message: 'Missing order_reference_number or stripe_customer_id',
            };
          }

          if (payment_phase === 'final') {
            this.logger.log('Entered in final payment phase');
          }

          if (payment_phase === 'initial') {
            this.logger.log('Entered in initial payment phase');
            this.logger.log('Entered in normal reservation');

            const result = await this.reservationService.makeFinalReservation({
                order_reference_number: order_reference_number,
                paymentId: paymentObject.id,
                stripeCustomerId: stripe_customer_id,
            });
            

            if (result.success) {
                this.logger.log(`final reservation created successfully using stripe webhook for ${order_reference_number}`)
                return {
                    success: result.success,
                    message: 'final reservation created successfully using stripe webhook',
                    result: result.result,
                };
            } else {
                this.logger.log(`${result.message} using stripe webhook for ${order_reference_number}`)
                return {
                    success: false,
                    message: result.message,
                    result: result.error,
                };  
            }
          }
          break;
        }

        case 'invoice.payment_succeeded':
        case 'checkout.session.completed':
        case 'payment_intent.created':
        case 'payment_intent.canceled':
        case 'payment_intent.payment_failed':
        case 'payment_intent.processing':
        case 'refund.created':
        case 'payment_intent.partially_funded': {
        //   paymentObject = event.data.object;
          this.logger.log(`Event type: ${event.type} triggered - ${ip}`);
          break;
        }

        default:
          this.logger.warn(`Unhandled event type ${event.type}`);
          break;
      }

      return { result: paymentObject };
    } catch (error) {
      this.logger.error(`Error from webhook: - ${ip} - ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Error from webhook: ${error.message}`);
    }
  }

}
