import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { standardResponse } from 'src/common/helpers/response.helper';
import { CreateOrderDto } from './dto/create-order.dto';
import { CheckoutSessionDto } from './dto/checkout-session.dto';
import Stripe from 'stripe';
const Razorpay = require('razorpay');

@Injectable()
export class PaymentGatewayService {

  private readonly logger = new Logger(PaymentGatewayService.name);

  private readonly razorpay: any;
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.razorpay = new Razorpay({
      key_id: configService.get<string>('RAZOR_PAY_KEY_ID'),
      key_secret: configService.get<string>('RAZOR_PAY_KEY_SECRET'),
    });
    this.stripe = new Stripe(configService.get<string>('STRIPE_SECRET_KEY')!);
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<any> {
    try {
      const options: any = {
        amount: Math.round(createOrderDto.amount * 100), // paise
        currency: createOrderDto.currency,
        receipt: createOrderDto.receiptID,
        notes: createOrderDto.notes || {},
      };

      const order = await this.razorpay.orders.create(options);

      return standardResponse(true, 'Successfully created order', 201, order, null, "-: createOrder function");
    } catch (error) {
        this.logger.error('Error creating Razorpay order: ', error);
        throw new HttpException(
          'Unable to create order for razorpay - createOrder function',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }

  async createCheckoutSession(checkoutSessionDto: CheckoutSessionDto) : Promise<any> {

    const priceInCents = Math.round(checkoutSessionDto.amount * 100);
    const YOUR_DOMAIN = this.configService.get<string>('STRIPE_DOMAIN');

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer: checkoutSessionDto.customerId,
        payment_intent_data: {
          setup_future_usage: 'off_session',
          description: `This is for the reservation of ${checkoutSessionDto.order_reference_number}`,
          metadata: {
            order_reference_number: checkoutSessionDto.order_reference_number,
            userType: checkoutSessionDto.userType,
            stripe_receipt_id: checkoutSessionDto.receiptId,
            stripe_customer_id: checkoutSessionDto.customerId,
            payment_phase: 'initial',
          },
        },
        line_items: [
          {
            price_data: {
              currency: checkoutSessionDto.currency,
              product_data: {
                name: `${checkoutSessionDto.order_reference_number}`,
                description: `This is for the reservation of ${checkoutSessionDto.order_reference_number}`,
              },
              unit_amount: priceInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}/booking-confirmed/${checkoutSessionDto.order_reference_number}?success=true&gatewayUsed=0&role=${checkoutSessionDto.userType}`,
        cancel_url: `${YOUR_DOMAIN}/booking-failed/${checkoutSessionDto.order_reference_number}?canceled=true&gatewayUsed=0&role=${checkoutSessionDto.userType}`,
      });

      if (!session) {
        this.logger.error('Failed to create Stripe session', session);
        throw new HttpException(
          'Unable to create Stripe session - createCheckoutSession',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return standardResponse(true , 'Successfully created checkout session', 200, {
        createSession: true,
        sessionURL: session.url,
        sessionID: session.id,
      }, null, "-: createCheckoutSession function");
    } catch (error) {
       this.logger.error('Error creating Stripe session: ', error);
       throw new HttpException(
          'Unable to create order for stripe - createCheckoutSession',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
}

