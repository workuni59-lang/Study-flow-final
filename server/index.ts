import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// Server uses SUPABASE_URL, but user may only have VITE_SUPABASE_URL
if (!process.env.SUPABASE_URL && process.env.VITE_SUPABASE_URL) {
  process.env.SUPABASE_URL = process.env.VITE_SUPABASE_URL;
}

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true }));

// ── Polar Checkout ──
app.post('/api/create-checkout', express.json(), async (req, res) => {
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

    const data = await response.json();
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

// ── Polar Webhook ──
app.post('/api/polar-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const event = req.body;
    if (event.type === 'checkout.created' || event.type === 'checkout.updated') {
      // Payment completed — update Supabase profile
      const userId = event.data?.metadata?.user_id;
      const isPaid = event.data?.status === 'succeeded' || event.data?.status === 'paid';

      if (userId && isPaid) {
        const { createClient } = await import('@supabase/supabase-js');
        const sb = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        await sb
          .from('profiles')
          .update({ is_premium: true, premium_until: event.data?.expires_at || null })
          .eq('id', userId);
      }
    }

    if (event.type === 'subscription.active' || event.type === 'subscription.updated') {
      const userId = event.data?.metadata?.user_id;
      if (userId) {
        const { createClient } = await import('@supabase/supabase-js');
        const sb = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        await sb
          .from('profiles')
          .update({ is_premium: true, premium_until: event.data?.current_period_end || null })
          .eq('id', userId);
      }
    }

    if (event.type === 'subscription.revoked' || event.type === 'subscription.canceled') {
      const userId = event.data?.metadata?.user_id;
      if (userId) {
        const { createClient } = await import('@supabase/supabase-js');
        const sb = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        await sb
          .from('profiles')
          .update({ is_premium: false, premium_until: null })
          .eq('id', userId);
      }
    }

    res.sendStatus(200);
  } catch (err: any) {
    console.error('Webhook error:', err);
    res.sendStatus(200); // Always ack Polar
  }
});

app.listen(PORT, () => console.log(`Server running on :${PORT}`));

// ── Success redirect handler (bypasses Polar for dev testing) ──
app.get('/api/checkout-success', async (req, res) => {
  const userId = req.query.userId as string;
  if (!userId) return res.redirect(process.env.VITE_APP_URL || 'http://localhost:3000');

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await sb.from('profiles').update({ is_premium: true }).eq('id', userId);
  } catch (e) {
    console.error('Failed to activate premium:', e);
  }

  res.redirect(`${process.env.VITE_APP_URL || 'http://localhost:3000'}/settings?upgrade=success`);
});

// ── Dev bypass: activate premium without Polar (testing only) ──
app.post('/api/dev-activate', express.json(), async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await sb.from('profiles').update({ is_premium: true }).eq('id', userId);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
