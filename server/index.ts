import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Server uses SUPABASE_URL, but user may only have VITE_SUPABASE_URL
if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
}

const app = express();
const PORT = process.env.PORT || 4000;

// ── CORS: restrict to known frontend origin ──
const allowedOrigin = process.env.VITE_APP_URL || 'http://localhost:3000';
app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Security headers (CSP, XSS, clickjacking, etc.) ──
app.use(helmet({
  contentSecurityPolicy: false, // Tailwind uses inline styles extensively
  crossOriginEmbedderPolicy: false, // Allow loading external resources (fonts, etc.)
}));

// Additional security headers that Helmet doesn't set by default
app.use((_req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// ── Rate limiting: prevent abuse ──
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,             // max 60 requests per minute per IP
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiters to routes (applied per-route below instead of globally
// so the webhook gets a tighter limit)

// ── CSRF check (verify Origin/Referer for non-GET requests) ──
function csrfCheck(req: any, res: any, next: any) {
  if (req.method === 'GET' || req.method === 'OPTIONS') return next();

  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const allowed = allowedOrigin;

  const isAllowedOrigin = origin && (
    origin === allowed ||
    origin.endsWith('.studyflow.space') ||
    origin.startsWith('http://localhost')
  );
  const isAllowedReferer = referer && (
    referer.startsWith(allowed) ||
    referer.includes('.studyflow.space') ||
    referer.includes('localhost')
  );

  // If neither header is present, allow (mobile apps, server-to-server)
  if (!origin && !referer) return next();

  if (!isAllowedOrigin && !isAllowedReferer) {
    console.warn(`[CSRF] Blocked request from origin=${origin} referer=${referer}`);
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
}

app.use(csrfCheck);

// ── Reusable Supabase admin client ──
let _sb: any = null;
async function getSb() {
  if (!_sb) {
    const { createClient } = await import('@supabase/supabase-js');
    _sb = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return _sb;
}

// ── Helper: get authenticated user ID from Bearer token ──
async function getAuthUserId(req: any): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const sb = await getSb();
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user.id;
}

// ── Helper: resolve the real user ID from token, body userId, or email fallback ──
async function resolveUserId(req: any, sb: any, email: string): Promise<string | null> {
  // 1. Try auth token
  const fromToken = await getAuthUserId(req);
  if (fromToken) return fromToken;

  // 2. Try userId from request body
  const bodyUserId = req.body?.userId;
  if (bodyUserId) {
    const { data: existing } = await sb.auth.admin.getUserById(bodyUserId).catch(() => ({ data: null }));
    if (existing?.user?.id) return existing.user.id;
  }

  // 3. Fallback: find user by email
  const { data: users } = await sb.auth.admin.listUsers().catch(() => ({ data: null }));
  const match = users?.users?.find((u: any) => u.email === email);
  if (match) return match.id;

  return null;
}

// ── Webhook signature verification (same algorithm as Worker) ──
function verifyWebhookSignature(
  rawBody: string,
  webhookId: string,
  webhookTimestamp: string,
  signatureHeader: string,
  secret: string,
): boolean {
  const secretBytes = Buffer.from(secret, 'base64');
  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const expectedSignatures = signatureHeader.split(' ');

  for (const sig of expectedSignatures) {
    const sigBytes = Buffer.from(sig, 'base64');
    const computed = crypto.createHmac('sha256', secretBytes).update(signedContent).digest();
    if (crypto.timingSafeEqual(computed, sigBytes)) return true;
  }
  return false;
}

// ── Polar Checkout ──
app.post('/api/create-checkout', apiLimiter, express.json({ limit: '100kb' }), async (req, res) => {
  try {
    const { userId, email, returnUrl, priceType } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const polarToken = process.env.POLAR_ACCESS_TOKEN;
    const orgId = process.env.POLAR_ORGANIZATION_ID;
    if (!polarToken || !orgId) {
      return res.status(500).json({ error: 'Polar not configured on server' });
    }

    const productId = priceType === 'yearly'
      ? process.env.POLAR_PRODUCT_YEARLY
      : process.env.POLAR_PRODUCT_MONTHLY;
    if (!productId) {
      return res.status(500).json({ error: `Missing product ID for ${priceType || 'monthly'}` });
    }

    const polarBase = process.env.POLAR_API_URL || 'https://sandbox-api.polar.sh';

    const response = await fetch(
      `${polarBase}/v1/checkouts/custom/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${polarToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization_id: orgId,
          customer_email: email || undefined,
          metadata: { user_id: userId },
          success_url: returnUrl || `${req.headers.origin}/settings?upgrade=success`,
          product_id: productId,
        }),
      }
    );

    const data: any = await response.json();
    if (!response.ok) {
      const detail = data.detail || data.message || data;
      const msg = typeof detail === 'string' ? detail : JSON.stringify(detail);
      console.error('Polar API error:', response.status, msg);
      return res.status(response.status).json({ error: msg });
    }

    res.json({ url: data.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Polar Webhook (with signature verification + grace period) ──
app.post('/api/polar-webhook', webhookLimiter, express.raw({ type: 'application/json', limit: '100kb' }), async (req, res) => {
  try {
    const rawBody = req.body?.toString() || '{}';

    // Verify signature (skip if POLAR_WEBHOOK_SECRET not set)
    const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;
    if (webhookSecret) {
      const webhookId = req.headers['webhook-id'] as string;
      const webhookTimestamp = req.headers['webhook-timestamp'] as string;
      const signatureHeader = req.headers['webhook-signature'] as string;

      if (!webhookId || !webhookTimestamp || !signatureHeader) {
        console.error('[Webhook] Missing signature headers');
        return res.sendStatus(401);
      }

      const valid = verifyWebhookSignature(rawBody, webhookId, webhookTimestamp, signatureHeader, webhookSecret);
      if (!valid) {
        console.error('[Webhook] Invalid signature');
        return res.sendStatus(401);
      }
    }

    const event = JSON.parse(rawBody);
    const sb = await getSb();
    const eventType = event.type;
    const userId = event.data?.metadata?.user_id;
    const eventTime = new Date().toISOString();

    console.log(`[Webhook] Received: ${eventType}`, userId ? `user=${userId}` : '', `at=${eventTime}`);

    if (eventType === 'checkout.created' || eventType === 'checkout.updated') {
      const isPaid = event.data?.status === 'succeeded' || event.data?.status === 'paid';
      if (userId && isPaid) {
        await sb
          .from('profiles')
          .update({ is_premium: true, premium_until: event.data?.expires_at || null })
          .eq('id', userId);
        console.log(`[Webhook] Premium activated for ${userId}`);
      }
    }

    if (eventType === 'subscription.active' || eventType === 'subscription.updated') {
      if (userId) {
        await sb
          .from('profiles')
          .update({ is_premium: true, premium_until: event.data?.current_period_end || null })
          .eq('id', userId);
        console.log(`[Webhook] Subscription active for ${userId}`);
      }
    }

    if (eventType === 'subscription.revoked' || eventType === 'subscription.canceled') {
      if (userId) {
        // Grace period: keep premium until current_period_end if in the future
        const periodEnd = event.data?.current_period_end;
        if (periodEnd && new Date(periodEnd) > new Date()) {
          await sb
            .from('profiles')
            .update({ is_premium: true, premium_until: periodEnd })
            .eq('id', userId);
          console.log(`[Webhook] Subscription canceled, premium until ${periodEnd} for ${userId}`);
        } else {
          await sb
            .from('profiles')
            .update({ is_premium: false, premium_until: null })
            .eq('id', userId);
          console.log(`[Webhook] Premium revoked for ${userId}`);
        }
      }
    }

    if (eventType === 'subscription.uncanceled') {
      if (userId) {
        await sb
          .from('profiles')
          .update({ is_premium: true, premium_until: event.data?.current_period_end || null })
          .eq('id', userId);
        console.log(`[Webhook] Subscription uncanceled for ${userId}`);
      }
    }

    if (eventType === 'subscription.incomplete' || eventType === 'subscription.past_due') {
      console.warn(`[Webhook] Subscription issue for ${userId}: ${eventType}`);
    }

    if (!['checkout.created', 'checkout.updated', 'subscription.active', 'subscription.updated',
          'subscription.revoked', 'subscription.canceled', 'subscription.uncanceled',
          'subscription.incomplete', 'subscription.past_due'].includes(eventType)) {
      console.warn(`[Webhook] Unhandled event type: ${eventType}`);
    }

    res.sendStatus(200);
  } catch (err: any) {
    console.error('[Webhook] Error:', err);
    res.sendStatus(200);
  }
});

// ── Checkout success redirect (production-gated) ──
app.get('/api/checkout-success', apiLimiter, async (req, res) => {
  const isDev = process.env.NODE_ENV !== 'production' || process.env.IS_DEV === 'true';
  if (!isDev) {
    return res.status(403).json({ error: 'Not available in production' });
  }

  const userId = req.query.userId as string;
  if (!userId) return res.redirect(process.env.VITE_APP_URL || 'http://localhost:3000');

  try {
    const sb = await getSb();
    await sb.from('profiles').update({ is_premium: true }).eq('id', userId);
  } catch (e) {
    console.error('Failed to activate premium:', e);
  }

  res.redirect(`${process.env.VITE_APP_URL || 'http://localhost:3000'}/settings?upgrade=success`);
});

// ── Dev bypass: activate premium (production-gated) ──
app.post('/api/dev-activate', apiLimiter, express.json({ limit: '100kb' }), async (req, res) => {
  const isDev = process.env.NODE_ENV !== 'production' || process.env.IS_DEV === 'true';
  if (!isDev) {
    return res.status(403).json({ error: 'Not available in production' });
  }

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    const sb = await getSb();
    await sb.from('profiles').update({ is_premium: true }).eq('id', userId);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Delete Account ──
app.post('/api/delete-account', apiLimiter, express.json({ limit: '100kb' }), async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const sb = await getSb();

    // Delete all user data (FK cascade should handle most, but be explicit)
    await Promise.all([
      sb.from('profiles').delete().eq('id', userId).catch(() => {}),
      sb.from('tasks').delete().eq('user_id', userId).catch(() => {}),
      sb.from('subjects').delete().eq('user_id', userId).catch(() => {}),
      sb.from('daily_stats').delete().eq('user_id', userId).catch(() => {}),
      sb.from('user_stats').delete().eq('user_id', userId).catch(() => {}),
      sb.from('gamification_state').delete().eq('user_id', userId).catch(() => {}),
      sb.from('leaderboard_entries').delete().eq('user_id', userId).catch(() => {}),
      sb.from('verification_codes').delete().eq('user_id', userId).catch(() => {}),
    ]);

    // Delete the auth user (this cascades via FK to most tables)
    const { error } = await sb.auth.admin.deleteUser(userId);
    if (error) {
      console.error('[DeleteAccount] Auth delete error:', error.message);
      return res.status(500).json({ error: 'Failed to delete account' });
    }

    console.log(`[DeleteAccount] Deleted user ${userId}`);
    res.json({ ok: true });
  } catch (err: any) {
    console.error('[DeleteAccount] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Export User Data ──
app.post('/api/export-data', apiLimiter, express.json({ limit: '100kb' }), async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const sb = await getSb();

    const [profile, tasks, subjects, dailyStats, userStats, gamification, leaderboard, verificationCodes] = await Promise.all([
      sb.from('profiles').select('*').eq('id', userId).maybeSingle().then(r => ({ error: r.error, data: r.data })),
      sb.from('tasks').select('*').eq('user_id', userId).then(r => ({ error: r.error, data: r.data })),
      sb.from('subjects').select('*').eq('user_id', userId).then(r => ({ error: r.error, data: r.data })),
      sb.from('daily_stats').select('*').eq('user_id', userId).then(r => ({ error: r.error, data: r.data })),
      sb.from('user_stats').select('*').eq('user_id', userId).maybeSingle().then(r => ({ error: r.error, data: r.data })),
      sb.from('gamification_state').select('*').eq('user_id', userId).maybeSingle().then(r => ({ error: r.error, data: r.data })),
      sb.from('leaderboard_entries').select('*').eq('user_id', userId).then(r => ({ error: r.error, data: r.data })),
      sb.from('verification_codes').select('*').eq('user_id', userId).then(r => ({ error: r.error, data: r.data })),
    ]);

    res.json({
      exported_at: new Date().toISOString(),
      profile: profile.data,
      tasks: tasks.data ?? [],
      subjects: subjects.data ?? [],
      daily_stats: dailyStats.data ?? [],
      user_stats: userStats.data,
      gamification_state: gamification.data,
      leaderboard_entries: leaderboard.data ?? [],
      verification_codes: verificationCodes.data ?? [],
    });
  } catch (err: any) {
    console.error('[ExportData] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── Customer Portal Link ──
app.post('/api/customer-portal', apiLimiter, express.json({ limit: '100kb' }), async (req, res) => {
  try {
    const userId = await getAuthUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const polarToken = process.env.POLAR_ACCESS_TOKEN;
    if (!polarToken) return res.status(500).json({ error: 'Polar not configured' });

    const polarBase = process.env.POLAR_API_URL || 'https://sandbox-api.polar.sh';

    // Look up the customer by user_id metadata
    const customerResp = await fetch(`${polarBase}/v1/customers/?metadata%5Buser_id%5D=${userId}`, {
      headers: { Authorization: `Bearer ${polarToken}` },
    });
    const customerData: any = await customerResp.json();
    const customers = customerData?.items || customerData?.data || [];

    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(404).json({ error: 'No customer found' });
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
      return res.status(portalResp.status).json({ error: portalData.detail || 'Failed to create portal' });
    }

    res.json({ url: portalData.url });
  } catch (err: any) {
    console.error('[CustomerPortal] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on :${PORT}`));
