import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import crypto from 'crypto';

function safeCompare(a: string, b: string) {
  const aa = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function verifyShopifyHmac(query: Record<string, any>, secret: string) {
  // Shopify HMAC check for OAuth callback uses query params excluding "hmac" and "signature"
  const { hmac, signature, ...rest } = query;
  if (!hmac) return false;

  const message = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${Array.isArray(rest[k]) ? rest[k].join(',') : rest[k]}`)
    .join('&');

  const digest = crypto.createHmac('sha256', secret).update(message).digest('hex');
  return safeCompare(digest, String(hmac));
}

@Controller('api')
export class AuthController {
  @Get('auth')
  async auth(@Req() req: Request, @Res() res: Response, @Query() query: any) {
    const apiKey = process.env.SHOPIFY_API_KEY!;
    const apiSecret = process.env.SHOPIFY_API_SECRET!;
    const scopes = process.env.SHOPIFY_SCOPES || 'read_orders,write_fulfillments';
    const appUrl = process.env.APP_URL!;

    // 1) Kalau ada "code" => ini callback dari Shopify, proses token exchange
    if (query.code) {
      const ok = verifyShopifyHmac(query, apiSecret);
      if (!ok) throw new BadRequestException('Invalid HMAC');

      const shop = String(query.shop || '');
      if (!shop.endsWith('.myshopify.com')) {
        throw new BadRequestException('Invalid shop');
      }

      const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: apiKey,
          client_secret: apiSecret,
          code: query.code,
        }),
      });

      const tokenJson = await tokenRes.json();
      if (!tokenRes.ok) {
        throw new BadRequestException(tokenJson);
      }

      // tokenJson.access_token = INI TOKEN YANG KAMU CARI
      // Untuk testing: tampilkan di browser dulu (jangan produksi)
      return res.status(200).send({
        ok: true,
        shop,
        scope: tokenJson.scope,
        access_token: tokenJson.access_token,
        note: 'Copy access_token ini. Untuk production simpan ke DB.',
      });
    }

    // 2) Kalau belum ada "code" => mulai OAuth (redirect ke authorize)
    const shop = String(query.shop || '');
    if (!shop.endsWith('.myshopify.com')) {
      throw new BadRequestException(
        'Tambahkan ?shop=interbis-dev.myshopify.com di URL /api/auth',
      );
    }

    // state/nonce (optional tapi bagus)
    const state = crypto.randomBytes(16).toString('hex');

    const redirectUri = `${appUrl}/api/auth`;

    const installUrl =
      `https://${shop}/admin/oauth/authorize` +
      `?client_id=${encodeURIComponent(apiKey)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${encodeURIComponent(state)}`;

    return res.redirect(installUrl);
  }
}
