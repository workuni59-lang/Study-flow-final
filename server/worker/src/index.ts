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
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  IS_DEV?: string;
}

// ── Simple in-memory rate limiter (per IP, sliding window) ──
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_CLEANUP_INTERVAL = 300_000; // 5 min
let lastCleanup = Date.now();

function checkRateLimit(clientIp: string, maxRequests: number, windowMs: number): boolean {
  // Lazy cleanup of stale entries
  const now = Date.now();
  if (now - lastCleanup > RATE_LIMIT_CLEANUP_INTERVAL) {
    for (const [ip, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(ip);
    }
    lastCleanup = now;
  }
  const entry = rateLimitMap.get(clientIp);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(clientIp, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

function corsHeaders(origin: string, env: Env): Record<string, string> {
  const allowed = env.FRONTEND_URL || 'http://localhost:3000';
  const isAllowed = !origin || origin === allowed || origin === 'https://studyflow.space' || origin === 'https://www.studyflow.space' || origin.endsWith('.studyflow.space');
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Strict-Transport-Security': 'max-age=15552000; includeSubDomains',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'none'; object-src 'none'; base-uri 'none'",
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
    const headers = { 'Content-Type': 'application/json', ...corsHeaders(origin, env) };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
    }

    try {
      // Rate limiting: 60 req/min for API, 20 req/min for webhook
      const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
      const isWebhook = url.pathname === '/api/polar-webhook';
      const maxReqs = isWebhook ? 20 : 60;

      if (!checkRateLimit(clientIp, maxReqs, 60_000)) {
        return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers });
      }

      switch (true) {
        case url.pathname === '/api/create-checkout' && request.method === 'POST':
          return handleCreateCheckout(request, env, headers, url.origin);
        case url.pathname === '/api/polar-webhook' && request.method === 'POST':
          return handlePolarWebhook(request, env);
        case url.pathname === '/api/checkout-success' && request.method === 'GET':
          return handleCheckoutSuccess(url, env, origin);
        case url.pathname === '/api/dev-activate' && request.method === 'POST':
          return handleDevActivate(request, env, headers);
        case url.pathname === '/api/diagnose' && request.method === 'GET':
          return handleDiagnose(env, headers);
        case url.pathname === '/api/send-verification-code' && request.method === 'POST':
          return handleSendVerificationCode(request, env, headers);
        case url.pathname === '/api/verify-code' && request.method === 'POST':
          return handleVerifyCode(request, env, headers);
        case url.pathname === '/api/delete-account' && request.method === 'POST':
          return handleDeleteAccount(request, env, headers);
        case url.pathname === '/api/export-data' && request.method === 'POST':
          return handleExportData(request, env, headers);
        case url.pathname === '/api/customer-portal' && request.method === 'POST':
          return handleCustomerPortal(request, env, headers);
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
      external_customer_id: userId,
      metadata: { user_id: userId },
      customer_metadata: { user_id: userId },
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

function extractUserId(data: any): string | undefined {
  if (!data) return;
  // Check metadata at top level (checkout events use this, also copied to subscription)
  if (data.metadata?.user_id) return String(data.metadata.user_id);
  // Check customer_metadata on checkout
  if (data.customer_metadata?.user_id) return String(data.customer_metadata.user_id);
  // Check customer.metadata (subscription events nest customer)
  if (data.customer?.metadata?.user_id) return String(data.customer.metadata.user_id);
  // Check external_customer_id (set on checkout creation)
  if (data.external_customer_id) return String(data.external_customer_id);
  // Check customer.external_id
  if (data.customer?.external_id) return String(data.customer.external_id);
}

async function activatePremium(db: ReturnType<typeof supabaseAdmin>, userId: string, periodEnd?: string | null) {
  if (!userId) return;
  const { error } = await db.from('profiles').update({
    is_premium: true,
    premium_until: periodEnd || null,
  }).eq('id', userId);
  if (error) {
    console.error(`[Webhook] DB update failed for ${userId}:`, error);
  } else {
    console.log(`[Webhook] Premium activated for ${userId}`);
  }
}

async function findAndActivate(db: ReturnType<typeof supabaseAdmin>, userId: string | undefined, email: string | undefined | null, periodEnd?: string | null, supabaseUrl?: string, serviceKey?: string) {
  if (userId) {
    const { data: match } = await db.from('profiles').select('id').eq('id', userId).maybeSingle();
    if (match) {
      await activatePremium(db, match.id, periodEnd);
      return;
    }
    console.log(`[Webhook] userId ${userId} not found in profiles`);
  }
  // Fallback: query auth.users by email via REST API (service_role bypasses auth schema RLS)
  if (email && supabaseUrl && serviceKey) {
    try {
      const url = `${supabaseUrl}/rest/v1/auth/users?select=id&email=eq.${encodeURIComponent(email)}&limit=1`;
      const res = await fetch(url, {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
      });
      if (res.ok) {
        const users = await res.json() as any[];
        if (users?.length) {
          await activatePremium(db, users[0].id, periodEnd);
          return;
        }
      }
    } catch (err) {
      console.error(`[Webhook] auth.users lookup failed for ${email}:`, err);
    }
  }
  console.error(`[Webhook] No profile found for userId=${userId} email=${email}`);
}

async function findAndDowngrade(db: ReturnType<typeof supabaseAdmin>, userId: string | undefined, email: string | undefined | null, periodEnd?: string | null, supabaseUrl?: string, serviceKey?: string) {
  let id: string | undefined;
  if (userId) {
    const { data: match } = await db.from('profiles').select('id').eq('id', userId).maybeSingle();
    if (match) id = userId;
  }
  if (!id && email && supabaseUrl && serviceKey) {
    try {
      const url = `${supabaseUrl}/rest/v1/auth/users?select=id&email=eq.${encodeURIComponent(email)}&limit=1`;
      const res = await fetch(url, {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` }
      });
      if (res.ok) {
        const users = await res.json() as any[];
        if (users?.length) id = users[0].id;
      }
    } catch (err) {
      console.error(`[Webhook] auth.users lookup failed for downgrade:`, err);
    }
  }
  if (id) {
    if (periodEnd && new Date(periodEnd) > new Date()) {
      await db.from('profiles').update({ is_premium: true, premium_until: periodEnd }).eq('id', id);
    } else {
      await db.from('profiles').update({ is_premium: false, premium_until: null }).eq('id', id);
    }
  }
}

async function handlePolarWebhook(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin') || '*';
  const whHeaders = corsHeaders(origin, env);

  try {
    const raw = await request.text();

    const webhookId = request.headers.get('webhook-id') || '';
    const webhookTimestamp = request.headers.get('webhook-timestamp') || '';
    const signatureHeader = request.headers.get('webhook-signature') || '';

    if (!webhookId || !webhookTimestamp || !signatureHeader) {
      console.error('Missing webhook headers:', { webhookId, webhookTimestamp, signatureHeader });
      return new Response('Unauthorized', { status: 401, headers: whHeaders });
    }

    const valid = await verifyWebhookSignature(raw, webhookId, webhookTimestamp, signatureHeader, env.POLAR_WEBHOOK_SECRET);
    if (!valid) {
      console.error('Invalid webhook signature');
      return new Response('Unauthorized', { status: 401, headers: whHeaders });
    }

    const event = JSON.parse(raw);
    const db = supabaseAdmin(env);

    console.log(`[Webhook] Received ${event.type}`);

    // Debug: log full payload structure (limit depth to avoid huge logs)
    const data = event.data;
    const debugInfo: any = { keys: data ? Object.keys(data) : null };
    if (data) {
      debugInfo.metadata = data.metadata;
      debugInfo.customer_metadata = data.customer_metadata;
      debugInfo.external_customer_id = data.external_customer_id;
      debugInfo.status = data.status;
      debugInfo.has_customer = !!data.customer;
      if (data.customer) {
        debugInfo.customer_keys = Object.keys(data.customer);
        debugInfo.customer_meta = data.customer.metadata;
        debugInfo.customer_ext_id = data.customer.external_id;
      }
      debugInfo.has_subscription_id = !!data.subscription_id;
      debugInfo.subscription_id = data.subscription_id;
    }
    console.log(`[Webhook] Debug ${event.type}:`, JSON.stringify(debugInfo));

    // Extract user_id from multiple possible paths
    const userId = extractUserId(event.data);
    const customerEmail = event.data?.customer?.email || event.data?.email || event.data?.customer_email;
    const periodEnd = event.data?.current_period_end;
    const subStatus = event.data?.status;
    const checkoutStatus = event.data?.status;
    const supUrl = env.SUPABASE_URL;
    const svcKey = env.SUPABASE_SERVICE_ROLE_KEY;

    // Helper for auth.users email lookup
    async function resolveProfileId(email: string | undefined | null): Promise<string | null> {
      if (!email || !supUrl || !svcKey) return null;
      try {
        const url = `${supUrl}/rest/v1/auth/users?select=id&email=eq.${encodeURIComponent(email)}&limit=1`;
        const res = await fetch(url, {
          headers: { apikey: svcKey, Authorization: `Bearer ${svcKey}` }
        });
        if (res.ok) {
          const users = await res.json() as any[];
          if (users?.length) return users[0].id;
        }
      } catch (err) {
        console.error(`[Webhook] auth.users lookup failed:`, err);
      }
      return null;
    }

    // Checkout completed — activate premium
    if (event.type === 'checkout.created' || event.type === 'checkout.updated') {
      if (checkoutStatus === 'succeeded' || checkoutStatus === 'paid' || checkoutStatus === 'confirmed') {
        await findAndActivate(db, userId, customerEmail, undefined, supUrl, svcKey);
      }
    }

    // Subscription created (trial or instant) — activate premium
    if (event.type === 'subscription.created') {
      if (subStatus === 'trialing' || subStatus === 'active' || subStatus === 'incomplete') {
        await findAndActivate(db, userId, customerEmail, periodEnd, supUrl, svcKey);
      } else {
        console.log(`[Webhook] subscription.created ignored (status: ${subStatus})`);
      }
    }

    // Subscription active or updated — activate premium
    if (event.type === 'subscription.active' || event.type === 'subscription.updated') {
      await findAndActivate(db, userId, customerEmail, periodEnd, supUrl, svcKey);
    }

    // Order events (payment processed) — activate premium
    if (event.type === 'order.paid' || event.type === 'order.created') {
      await findAndActivate(db, userId, customerEmail, periodEnd, supUrl, svcKey);
    }

    // Customer state changed — sync premium
    if (event.type === 'customer.state_changed') {
      const resolvedId = userId && (await db.from('profiles').select('id').eq('id', userId).maybeSingle()).data?.id
        ? userId
        : await resolveProfileId(customerEmail);
      if (resolvedId) {
        const hasActiveSub = event.data?.active_subscriptions?.length > 0;
        if (hasActiveSub) {
          await activatePremium(db, resolvedId);
        } else if ((await db.from('profiles').select('is_premium').eq('id', resolvedId).maybeSingle()).data?.is_premium) {
          await db.from('profiles').update({ is_premium: false, premium_until: null }).eq('id', resolvedId);
        }
      }
    }

    // Subscription revoked or canceled
    if (event.type === 'subscription.revoked' || event.type === 'subscription.canceled') {
      await findAndDowngrade(db, userId, customerEmail, periodEnd, supUrl, svcKey);
    }

    if (event.type === 'subscription.uncanceled') {
      await findAndActivate(db, userId, customerEmail, periodEnd, supUrl, svcKey);
    }

    if (event.type === 'subscription.incomplete' || event.type === 'subscription.past_due') {
      console.warn(`[Webhook] Subscription issue for ${userId || '?'}: ${event.type}`);
    }

    // Log unhandled event types
    const handledTypes = ['checkout.created', 'checkout.updated', 'subscription.created', 'subscription.active',
      'subscription.updated', 'subscription.revoked', 'subscription.canceled', 'subscription.uncanceled',
      'subscription.incomplete', 'subscription.past_due', 'order.paid', 'order.created', 'customer.state_changed'];
    if (!handledTypes.includes(event.type)) {
      console.warn(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return new Response('OK', { status: 200, headers: whHeaders });
  } catch (err: any) {
    console.error('Webhook error:', err);
    return new Response('OK', { status: 200, headers: whHeaders });
  }
}

async function handleCheckoutSuccess(url: URL, env: Env, origin: string): Promise<Response> {
  const frontendUrl = env.FRONTEND_URL || origin;
  const csHeaders = corsHeaders(origin, env);

  // Production gate
  if (env.IS_DEV !== 'true') {
    return new Response(JSON.stringify({ error: 'Not available in production' }), { status: 403, headers: { 'Content-Type': 'application/json', ...csHeaders } });
  }

  const userId = url.searchParams.get('userId');
  if (!userId) {
    return new Response(null, { status: 302, headers: { Location: frontendUrl, ...csHeaders } });
  }

  try {
    const db = supabaseAdmin(env);
    await db.from('profiles').update({ is_premium: true }).eq('id', userId);
  } catch (e) {
    console.error('Failed to activate premium:', e);
  }

  return new Response(null, { status: 302, headers: { Location: `${frontendUrl}/settings?upgrade=success`, ...csHeaders } });
}

async function handleDiagnose(env: Env, headers: Record<string, string>): Promise<Response> {
  const results: any = {};
  try {
    const db = supabaseAdmin(env);
    // List profiles (no email column, just id, display_name, is_premium)
    const { data: profiles } = await db.from('profiles').select('id, display_name, is_premium, premium_until').limit(20);
    results.profiles = profiles || [];
    // Try auth.users lookup by email
    const supUrl = env.SUPABASE_URL;
    const svcKey = env.SUPABASE_SERVICE_ROLE_KEY;
    let authUsers: any[] = [];
    if (supUrl && svcKey) {
      try {
        const url = `${supUrl}/rest/v1/auth/users?select=id,email&email=eq.workuni59%40gmail.com&limit=5`;
        const res = await fetch(url, {
          headers: { apikey: svcKey, Authorization: `Bearer ${svcKey}` }
        });
        if (res.ok) authUsers = await res.json() as any[];
      } catch {}
    }
    results.auth_users_lookup = authUsers.length ? authUsers : { found: false };
    // Check the Polar userId directly
    const { data: byId } = await db.from('profiles').select('id, display_name, is_premium').eq('id', 'c9f55212-8b6a-4b4b-8337-437bf9ae54a8').maybeSingle();
    results.lookup_by_user_id = byId || { found: false };
  } catch (err: any) {
    results.error = err.message;
  }
  results.env = {
    hasSupabaseUrl: !!env.SUPABASE_URL,
    hasServiceKey: !!env.SUPABASE_SERVICE_ROLE_KEY,
    hasPolarToken: !!env.POLAR_ACCESS_TOKEN,
    hasWebhookSecret: !!env.POLAR_WEBHOOK_SECRET,
    frontendUrl: env.FRONTEND_URL || '(not set)',
    polarApi: env.POLAR_API_URL || '(default)',
  };
  return new Response(JSON.stringify(results, null, 2), { status: 200, headers });
}

async function handleDevActivate(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  if (env.IS_DEV !== 'true') {
    return new Response(JSON.stringify({ error: 'Not available in production' }), { status: 403, headers });
  }

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

async function handleSendVerificationCode(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  try {
    const body: any = await request.json();
    const { userId, email } = body;
    if (!userId || !email) {
      return new Response(JSON.stringify({ error: 'userId and email required' }), { status: 400, headers });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const db = supabaseAdmin(env);

    await db.from('verification_codes').update({ used: true }).eq('user_id', userId);
    await db.from('verification_codes').insert({
      user_id: userId,
      email,
      code,
      expires_at: expiresAt,
    });

    const resendKey = env.RESEND_API_KEY;
    const emailFrom = env.EMAIL_FROM || 'noreply@studyflow.space';

    if (resendKey) {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: emailFrom,
          to: email,
          subject: 'Your StudyFlow verification code',
          html: `<div style="font-family:sans-serif;padding:24px;max-width:480px;margin:0 auto;">
            <h2 style="color:#7432FF;">StudyFlow</h2>
            <p style="color:#333;font-size:14px;line-height:1.5;">Your verification code is:</p>
            <div style="background:#f4f4f6;border-radius:12px;padding:16px;text-align:center;margin:16px 0;letter-spacing:8px;font-size:32px;font-weight:700;color:#1a1a2e;">${code}</div>
            <p style="color:#666;font-size:12px;">This code expires in 15 minutes.</p>
          </div>`,
        }),
      });
      if (!resp.ok) {
        const errText = await resp.text();
        console.error('Resend API error:', resp.status, errText);
        return new Response(JSON.stringify({ error: `Email send failed: ${errText}` }), { status: 502, headers });
      }
    }

    console.log(`[Verification] Code for ${email} (${userId}): ${code}`);

    return new Response(JSON.stringify({ ok: true, devCode: resendKey ? undefined : code }), { status: 200, headers });
  } catch (err: any) {
    console.error('send-verification-code error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

async function handleVerifyCode(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  try {
    const body: any = await request.json();
    const { userId, code } = body;
    if (!userId || !code) {
      return new Response(JSON.stringify({ error: 'userId and code required' }), { status: 400, headers });
    }

    const db = supabaseAdmin(env);

    const { data: record } = await db
      .from('verification_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('code', code)
      .eq('used', false)
      .single();

    if (!record) {
      return new Response(JSON.stringify({ error: 'Invalid or expired code' }), { status: 400, headers });
    }

    if (new Date(record.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Code has expired' }), { status: 400, headers });
    }

    await db.from('verification_codes').update({ used: true }).eq('id', record.id);

    await db.auth.admin.updateUserById(userId, { email_confirm: true });

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (err: any) {
    console.error('verify-code error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

async function handleDeleteAccount(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
    }
    const token = authHeader.slice(7);
    const db = supabaseAdmin(env);
    const { data: { user } } = await db.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
    }

    const userId = user.id;

    const safeDelete = async (table: string, column: string, value: string) => {
      try { await db.from(table as any).delete().eq(column, value); } catch {}
    };
    await Promise.all([
      safeDelete('profiles', 'id', userId),
      safeDelete('tasks', 'user_id', userId),
      safeDelete('subjects', 'user_id', userId),
      safeDelete('daily_stats', 'user_id', userId),
      safeDelete('user_stats', 'user_id', userId),
      safeDelete('gamification_state', 'user_id', userId),
      safeDelete('leaderboard_entries', 'user_id', userId),
      safeDelete('verification_codes', 'user_id', userId),
    ]);

    const { error } = await db.auth.admin.deleteUser(userId);
    if (error) {
      console.error('[DeleteAccount] Auth delete error:', error.message);
      return new Response(JSON.stringify({ error: 'Failed to delete account' }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (err: any) {
    console.error('[DeleteAccount] Error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

async function handleExportData(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
    }
    const token = authHeader.slice(7);
    const db = supabaseAdmin(env);
    const { data: { user } } = await db.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
    }

    const userId = user.id;

    const [profile, tasks, subjects, dailyStats, userStats, gamification, leaderboard, verificationCodes] = await Promise.all([
      db.from('profiles').select('*').eq('id', userId).maybeSingle().then(r => ({ error: r.error, data: r.data })),
      db.from('tasks').select('*').eq('user_id', userId).then(r => ({ error: r.error, data: r.data })),
      db.from('subjects').select('*').eq('user_id', userId).then(r => ({ error: r.error, data: r.data })),
      db.from('daily_stats').select('*').eq('user_id', userId).then(r => ({ error: r.error, data: r.data })),
      db.from('user_stats').select('*').eq('user_id', userId).maybeSingle().then(r => ({ error: r.error, data: r.data })),
      db.from('gamification_state').select('*').eq('user_id', userId).maybeSingle().then(r => ({ error: r.error, data: r.data })),
      db.from('leaderboard_entries').select('*').eq('user_id', userId).then(r => ({ error: r.error, data: r.data })),
      db.from('verification_codes').select('*').eq('user_id', userId).then(r => ({ error: r.error, data: r.data })),
    ]);

    return new Response(JSON.stringify({
      exported_at: new Date().toISOString(),
      profile: profile.data,
      tasks: tasks.data ?? [],
      subjects: subjects.data ?? [],
      daily_stats: dailyStats.data ?? [],
      user_stats: userStats.data,
      gamification_state: gamification.data,
      leaderboard_entries: leaderboard.data ?? [],
      verification_codes: verificationCodes.data ?? [],
    }), { status: 200, headers });
  } catch (err: any) {
    console.error('[ExportData] Error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}

async function handleCustomerPortal(
  request: Request,
  env: Env,
  headers: Record<string, string>,
): Promise<Response> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
    }
    const token = authHeader.slice(7);
    const db = supabaseAdmin(env);
    const { data: { user } } = await db.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers });
    }

    const userId = user.id;
    const polarToken = env.POLAR_ACCESS_TOKEN;
    if (!polarToken) {
      return new Response(JSON.stringify({ error: 'Polar not configured' }), { status: 500, headers });
    }

    const polarBase = env.POLAR_API_URL || 'https://sandbox-api.polar.sh';

    const customerResp = await fetch(`${polarBase}/v1/customers/?metadata%5Buser_id%5D=${userId}`, {
      headers: { Authorization: `Bearer ${polarToken}` },
    });
    const customerData: any = await customerResp.json();
    const customers = customerData?.items || customerData?.data || [];

    if (!Array.isArray(customers) || customers.length === 0) {
      return new Response(JSON.stringify({ error: 'No customer found' }), { status: 404, headers });
    }

    const customerId = customers[0].id;

    const portalResp = await fetch(`${polarBase}/v1/customers/${customerId}/portal`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${polarToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const portalData: any = await portalResp.json();
    if (!portalResp.ok) {
      return new Response(JSON.stringify({ error: portalData.detail || 'Failed to create portal' }), { status: portalResp.status, headers });
    }

    return new Response(JSON.stringify({ url: portalData.url }), { status: 200, headers });
  } catch (err: any) {
    console.error('[CustomerPortal] Error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
