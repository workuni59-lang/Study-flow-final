-- Verification codes for email verification during signup

CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_verification_codes_user_id ON public.verification_codes(user_id);
CREATE INDEX idx_verification_codes_code ON public.verification_codes(code);

ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Only the server (service_role) can read/write; users cannot query this table
CREATE POLICY "Service role can manage verification codes"
  ON public.verification_codes
  USING (true)
  WITH CHECK (true);
