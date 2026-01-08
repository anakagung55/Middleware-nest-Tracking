import { Body, Controller, Post } from '@nestjs/common';
import { ShopifyFulfillmentService } from '../tracking/shopify-fulfillment.service';

@Controller('api/tracking')
export class TrackingController {
  constructor(private readonly fulfillment: ShopifyFulfillmentService) {}

  @Post('update')
  async updateTracking(@Body() body: any) {
    const { orderId, trackingNumber, trackingUrl, company } = body;

    if (!orderId || !trackingNumber) {
      return { ok: false, message: 'orderId & trackingNumber wajib' };
    }

    const result = await this.fulfillment.createFulfillmentWithTracking({
      orderId: String(orderId),
      trackingNumber: String(trackingNumber),
      trackingUrl: trackingUrl ? String(trackingUrl) : '',
      company: company ? String(company) : '',
    });

    return { ok: true, fulfillment: result };
  }
}
