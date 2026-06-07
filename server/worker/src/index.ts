import { createClient } from '@supabase/supabase-js';

interface Env {
  POLAR_ACCESS_TOKEN: string;
  POLAR_ORGANIZATION_ID: string;
  POLAR_PRODUCT_MONTHLY: string;
  POLAR_PRODUCT_YEARLY: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  POLAR_API_URL?: string;
  FRONTEND_URL?: string;
  POLAR_WEBHOOK_SECRET: string;
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function supabaseAdmin(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

const encoder = new TextEncoder();

function base64decode(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function verifyWebhookSignature(
  rawBody: string,
  webhookId: string,
  webhookTimestamp: string,
  signatureHeader: string,
  secret: string,
): Promise<boolean> {
  const secretBytes = base64decode(secret);
  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;

  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );

  const expectedSignatures = signatureHeader.split(' ');

  for (const sig of expectedSignatures) {
    const sigBytes = base64decode(sig);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(signedContent),
    );
    if (valid) return true;
  }

  return false;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';
    const headers = { 'Content-Type': 'application/json', ...corsHeaders(origin) };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    try {
      switch (true) {
        case url.pathname === '/api/create-checkout' && request.method === 'POST':
          return handleCreateCheckout(request, env, headers, url.origin);
        case url.pathname === '/api/polar-webhook' && request.method === 'POST':
          return handlePolarWebhook(request, env);
        case url.pathname === '/api/checkout-success' && request.method === 'GET':
          return handleCheckoutSuccess(url, env, origin);
        case url.pathname === '/api/dev-activate' && request.method === 'POST':
          return handleDevActivate(request, env, headers);
        default:
          return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
      }
    } catch (err: any) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
  },
};

async function handleCreateCheckout(
  request: Request,
  env: Env,
  headers: Record<string, string>,
  requestOrigin: string,
): Promise<Response> {
  const body: Record<string, unknown> = await request.json();
  const { userId, email, returnUrl, priceType } = body as { userId?: string; email?: string; returnUrl?: string; priceType?: string };
  if (!userId) {
    return new Response(JSON.stringify({ error: 'userId required' }), { status: 400, headers });
  }

  const polarToken = env.POLAR_ACCESS_TOKEN;
  const orgId = env.POLAR_ORGANIZATION_ID;
  if (!polarToken || !orgId) {
    return new Response(JSON.stringify({ error: 'Polar not configured on server' }), { status: 500, headers });
  }

  const productId = priceType === 'yearly' ? env.POLAR_PRODUCT_YEARLY : env.POLAR_PRODUCT_MONTHLY;
  if (!productId) {
    return new Response(JSON.stringify({ error: `Missing product ID for ${priceType || 'monthly'}` }), { status: 500, headers });
  }

  const polarBase = env.POLAR_API_URL || 'https://sandbox-api.polar.sh';

  const response = await fetch(`${polarBase}/v1/checkouts/custom/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${polarToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      organization_id: orgId,
      customer_email: email || undefined,
      metadata: { user_id: userId },
      success_url: returnUrl || `${requestOrigin}/settings?upgrade=success`,
      products: [productId],
    }),
  });

  const data: any = await response.json();
  if (!response.ok) {
    const detail = data.detail || data.message || data;
    const msg = typeof detail === 'string' ? detail : JSON.stringify(detail);
    console.error('Polar API error:', response.status, msg);
    return new Response(JSON.stringify({ error: msg }), { status: response.status, headers });
  }

  return new Response(JSON.stringify({ url: data?.url }), { status: 200, headers });
}

async function handlePolarWebhook(request: Request, env: Env): Promise<Response> {
  try {
    const raw = await request.text();

    const webhookId = request.headers.get('webhook-id') || '';
    const webhookTimestamp = request.headers.get('webhook-timestamp') || '';
    const signatureHeader = request.headers.get('webhook-signature') || '';

    if (!webhookId || !webhookTimestamp || !signatureHeader) {
      console.error('Missing webhook headers:', { webhookId, webhookTimestamp, signatureHeader });
      return new Response('Unauthorized', { status: 401 });
    }

    const valid = await verifyWebhookSignature(raw, webhookId, webhookTimestamp, signatureHeader, env.POLAR_WEBHOOK_SECRET);
    if (!valid) {
      console.error('Invalid webhook signature');
      return new Response('Unauthorized', { status: 401 });
    }

    const event = JSON.parse(raw);
    const db = supabaseAdmin(env);

    if (event.type === 'checkout.created' || event.type === 'checkout.updated') {
      const userId = event.data?.metadata?.user_id;
      const isPaid = event.data?.status === 'succeeded' || event.data?.status === 'paid';
      if (userId && isPaid) {
        await db.from('profiles').update({ is_premium: true, premium_until: event.data?.expires_at || null }).eq('id', userId);
      }
    }

    if (event.type === 'subscription.active' || event.type === 'subscription.updated') {
      const userId = event.data?.metadata?.user_id;
      if (userId) {
        await db.from('profiles').update({ is_premium: true, premium_until: event.data?.current_period_end || null }).eq('id', userId);
      }
    }

    if (event.type === 'subscription.revoked' || event.type === 'subscription.canceled') {
      const userId = event.data?.metadata?.user_id;
      if (userId) {
        await db.from('profiles').update({ is_premium: false, premium_until: null }).eq('id', userId);
      }
    }

    return new Response('OK', { status: 200 });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return new Response('OK', { status: 200 });
  }
}

async function handleCheckoutSuccess(url: URL, env: Env, origin: string): Promise<Response> {
  const userId = url.searchParams.get('userId');
  const frontendUrl = env.FRONTEND_URL || origin;

  if (!userId) {
    return Response.redirect(frontendUrl, 302);
  }

  try {
    const db = supabaseAdmin(env);
    await db.from('profiles').update({ is_premium: true }).eq('id', userId);
  } catch (e) {
    console.error('Failed to activate premium:', e);
  }

  return Response.redirect(`${frontendUrl}/settings?upgrade=success`, 302);
}

async function handleDevActivate(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  const body: any = await request.json();
  const { userId } = body;
  if (!userId) {
    return new Response(JSON.stringify({ error: 'userId required' }), { status: 400, headers });
  }

  try {
    const db = supabaseAdmin(env);
    await db.from('profiles').update({ is_premium: true }).eq('id', userId);
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
