import { Controller, Post, Req, Res, HttpCode } from '@nestjs/common';
import { StripeWebhookService } from './stripe-webhook.service';
import { Request, Response } from 'express';

@Controller('webhook')
export class StripeWebhookController {
  constructor(private readonly stripeWebhookService: StripeWebhookService) {}

  @Post('payments/stripe')
  @HttpCode(200) // Stripe expects 200
  async handleStripeWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.stripeWebhookService.handleStripeEvent(req.body, String(req.ip));
      return res.status(200).json(result);
    } catch (error) {
      return res.status(error.getStatus?.() || 500).json({
        error: true,
        message: error.message,
      });
    }
  }
}
