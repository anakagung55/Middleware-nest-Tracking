import { Controller, Post, Req, Res, Headers } from '@nestjs/common';
import type { Request, Response } from 'express';

@Controller('api/webhooks')
export class WebhooksController {
  @Post('orders-create')
  async ordersCreate(
    @Req() req: Request,
    @Res() res: Response,
    @Headers() headers: Record<string, string>,
  ) {
    // sementara balikin 200 dulu biar 503 hilang
    console.log('Webhook masuk:', headers['x-shopify-topic'] || headers['X-Shopify-Topic']);
    return res.status(200).send('ok');
  }
}
