import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { WebhooksController } from './webhooks/webhooks.controller';
import { TrackingController } from './tracking/tracking.controller';
import { ShopifyFulfillmentService } from './tracking/shopify-fulfillment.service';
import { DebugController } from './debug.controller';

@Module({
  controllers: [
    AuthController,
    WebhooksController,
    TrackingController,
    DebugController, 
  ],
  providers: [
    ShopifyFulfillmentService,
  ],
})
export class AppModule {}
