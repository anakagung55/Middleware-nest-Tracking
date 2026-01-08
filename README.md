# Shopify Tracking Middleware (NestJS)

Middleware service untuk mengupdate tracking fulfillment order Shopify melalui Admin API (GraphQL).

## Deskripsi

Aplikasi ini adalah middleware NestJS yang terintegrasi dengan Shopify untuk mengelola fulfillment tracking. Aplikasi ini menyediakan endpoint API untuk autentikasi OAuth dengan Shopify dan update tracking number pada order fulfillment.

## Fitur Utama

### 1. OAuth Authentication dengan Shopify
- Endpoint `/api/auth` untuk inisiasi dan callback OAuth
- Verifikasi HMAC untuk keamanan
- Mendapatkan access token dari Shopify

### 2. Update Tracking Fulfillment
- Endpoint `POST /api/tracking/update` untuk update tracking number
- Menggunakan Shopify Admin API GraphQL
- Mendukung carrier tracking (contoh: JNE)

### 3. Webhook Handler
- Endpoint `POST /api/webhooks/orders-create` untuk menangani webhook order baru
- Logging untuk debugging

## Teknologi

- **Framework**: NestJS
- **Bahasa**: TypeScript
- **API**: Shopify Admin API (REST & GraphQL)
- **Authentication**: OAuth 2.0 dengan HMAC verification

## Setup dan Instalasi

### Prerequisites

- Node.js (versi 18+)
- NPM atau Yarn
- Shopify store dengan akses admin

### Instalasi

```bash
# Clone repository
git clone <repository-url>
cd middleware-nest

# Install dependencies
npm install
```

### Konfigurasi Environment

Buat file `.env` di root directory dengan konfigurasi berikut:

```env
# Shopify Configuration
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_TOKEN=your_admin_access_token
SHOPIFY_SCOPES=read_orders,write_fulfillments

# App Configuration
APP_URL=https://your-app-url.com
PORT=3000
```

## Menjalankan Aplikasi

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod

# Testing
npm run test
```

## API Documentation

### Authentication

#### GET /api/auth
Inisiasi OAuth flow dengan Shopify.

**Query Parameters:**
- `shop`: Domain Shopify store (contoh: `your-store.myshopify.com`)

**Response (setelah OAuth):**
```json
{
  "ok": true,
  "shop": "your-store.myshopify.com",
  "scope": "read_orders,write_fulfillments",
  "access_token": "shpat_...",
  "note": "Copy access_token ini. Untuk production simpan ke DB."
}
```

### Tracking Update

#### POST /api/tracking/update
Update tracking number pada fulfillment order.

**Request Body:**
```json
{
  "orderId": "123456789",
  "trackingNumber": "1234567890",
  "trackingUrl": "https://jne.co.id/tracking/1234567890",
  "company": "JNE"
}
```

**Response:**
```json
{
  "ok": true,
  "fulfillment": {
    "id": "gid://shopify/Fulfillment/12345",
    "status": "SUCCESS",
    "trackingInfo": {
      "number": "1234567890",
      "url": "https://jne.co.id/tracking/1234567890",
      "company": "JNE"
    }
  }
}
```

### Webhooks

#### POST /api/webhooks/orders-create
Menangani webhook ketika order baru dibuat di Shopify.

**Headers:**
- `X-Shopify-Topic`: `orders/create`
- `X-Shopify-Hmac-Sha256`: HMAC signature untuk verifikasi

## Struktur Proyek

```
src/
├── auth/
│   └── auth.controller.ts          # OAuth authentication
├── tracking/
│   ├── tracking.controller.ts      # Tracking update endpoint
│   └── shopify-fulfillment.service.ts # Shopify API service
├── webhooks/
│   └── webhooks.controller.ts      # Webhook handlers
├── app.controller.ts               # Main controller
├── app.module.ts                   # Main module
├── app.service.ts                  # Main service
└── main.ts                         # Application bootstrap
```

## Development

### Scripts

- `npm run start:dev`: Jalankan dalam mode development dengan hot reload
- `npm run build`: Build aplikasi untuk production
- `npm run test`: Jalankan unit tests
- `npm run lint`: Lint dan fix kode

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SHOPIFY_API_KEY` | Shopify App API Key | Yes |
| `SHOPIFY_API_SECRET` | Shopify App API Secret | Yes |
| `SHOPIFY_STORE_DOMAIN` | Shopify store domain | Yes |
| `SHOPIFY_ADMIN_TOKEN` | Admin access token | Yes |
| `SHOPIFY_SCOPES` | OAuth scopes | No (default: read_orders,write_fulfillments) |
| `APP_URL` | Application URL | Yes |
| `PORT` | Server port | No (default: 3000) |

## Contributing

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## License

This project is licensed under the UNLICENSED License.
- Webhook-ready (orders/create)
- Built with NestJS + Shopify Admin API (2026-01)

---

## Tech Stack
- Node.js
- NestJS
- Shopify Admin API (GraphQL)
- ngrok (local development)

---

## Environment Variables

Create `.env` file:

```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_TOKEN=shpat_xxxxx
SHOPIFY_API_VERSION=2026-01
```

Installation

```bash
npm install
npm run start:dev
```


Expose local server:

```bash
ngrok http 3000
```

OAuth Flow

Open:

/api/auth?shop=your-store.myshopify.com


Grant permission

Access token will be generated

Update Tracking API
Endpoint
POST /api/tracking/update

Payload
```json
{
  "orderId": 6861841137977,
  "trackingNumber": "JNE123456",
  "trackingUrl": "https://jne.co.id/track/JNE123456",
  "company": "JNE"
}
```

Success Response
```json
{
  "ok": true,
  "status": "SUCCESS",
  "fulfillment": {
    "id": "gid://shopify/Fulfillment/..."
  }
}
```
