import { Injectable } from '@nestjs/common';

@Injectable()
export class ShopifyFulfillmentService {
  private shop = process.env.SHOPIFY_STORE_DOMAIN!;
  private token = process.env.SHOPIFY_ADMIN_TOKEN!;
  private version = process.env.SHOPIFY_API_VERSION || '2024-10';

  private adminRest(path: string) {
    return `https://${this.shop}/admin/api/${this.version}${path}`;
  }

  private adminGraphql() {
    return `https://${this.shop}/admin/api/${this.version}/graphql.json`;
  }

  async getFulfillmentOrders(orderId: string) {
    const res = await fetch(this.adminRest(`/orders/${orderId}/fulfillment_orders.json`), {
      headers: {
        'X-Shopify-Access-Token': this.token,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    return data.fulfillment_orders ?? [];
  }

  async createFulfillmentWithTracking(params: {
    orderId: string;
    trackingNumber: string;
    trackingUrl: string;
    company: string;
  }) {
    const { orderId, trackingNumber, trackingUrl, company } = params;

    const fulfillmentOrders = await this.getFulfillmentOrders(orderId);
    if (!fulfillmentOrders.length) {
      throw new Error(`No fulfillment_orders found for orderId=${orderId}`);
    }

    // ambil fulfillment order pertama
    const fo = fulfillmentOrders[0];

    // line items (fulfillment_order_line_items)
    const lineItems = (fo.line_items || []).map((li: any) => ({
      id: String(li.id), // ini fulfillment_order_line_item_id
      quantity: li.quantity,
    }));

    if (!lineItems.length) {
      throw new Error(`No line_items found in fulfillment_order id=${fo.id}`);
    }

    const mutation = `
      mutation fulfillmentCreateV2($fulfillment: FulfillmentV2Input!) {
        fulfillmentCreateV2(fulfillment: $fulfillment) {
          fulfillment {
            id
            status
            trackingInfo {
              number
              url
              company
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      fulfillment: {
        notifyCustomer: false,
        trackingInfo: {
          number: trackingNumber,
          url: trackingUrl,
          company: company,
        },
        lineItemsByFulfillmentOrder: [
          {
            fulfillmentOrderId: `gid://shopify/FulfillmentOrder/${fo.id}`,
            fulfillmentOrderLineItems: lineItems.map((x: any) => ({
              id: `gid://shopify/FulfillmentOrderLineItem/${x.id}`,
              quantity: x.quantity,
            })),
          },
        ],
      },
    };

    const res = await fetch(this.adminGraphql(), {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': this.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(JSON.stringify(data));
    const errors = data?.data?.fulfillmentCreateV2?.userErrors;
    if (errors?.length) throw new Error(JSON.stringify(errors));

    return data.data.fulfillmentCreateV2.fulfillment;
  }
}
