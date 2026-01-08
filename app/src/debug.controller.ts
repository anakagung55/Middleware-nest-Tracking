import { Controller, Get, Query } from '@nestjs/common';

@Controller('api/debug')
export class DebugController {
  @Get('scopes')
  scopes() {
    return {
      shop: process.env.SHOPIFY_STORE_DOMAIN,
      scopes: process.env.SHOPIFY_SCOPES,
      tokenExists: !!process.env.SHOPIFY_ADMIN_TOKEN,
      apiVersion: process.env.SHOPIFY_API_VERSION,
    };
  }

  @Get('fulfillment-orders')
  async fulfillmentOrders(@Query('orderId') orderId: string) {
    const shop = process.env.SHOPIFY_STORE_DOMAIN!;
    const token = process.env.SHOPIFY_ADMIN_TOKEN!;
    const version = process.env.SHOPIFY_API_VERSION || '2024-10';

    const url = `https://${shop}/admin/api/${version}/orders/${orderId}/fulfillment_orders.json`;

    const res = await fetch(url, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });

    const text = await res.text();
    return text ? JSON.parse(text) : {};
  }
}
