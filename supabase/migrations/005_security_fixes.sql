-- Atomic credit deduction: SET credits = credits - cost in a single statement
-- This prevents the race condition where two concurrent requests both read stale balance
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id UUID, p_cost INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_credits INTEGER;
BEGIN
  UPDATE public.profiles
  SET credits = credits - p_cost
  WHERE id = p_user_id AND credits >= p_cost
  RETURNING credits INTO v_new_credits;

  IF v_new_credits IS NULL THEN
    RAISE EXCEPTION 'insufficient_credits' USING ERRCODE = 'P0001';
  END IF;

  RETURN v_new_credits;
END;
$$;

-- Atomic PayPal credit grant: INSERT transaction first (hits unique constraint on duplicate),
-- then UPDATE credits. Two concurrent callbacks for the same token: second insert fails → no double credit.
CREATE OR REPLACE FUNCTION public.add_credits_for_purchase(
  p_user_id    UUID,
  p_credits    INTEGER,
  p_token      TEXT,
  p_description TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_credits INTEGER;
BEGIN
  INSERT INTO public.credit_transactions (user_id, amount, type, stripe_session_id, description)
  VALUES (p_user_id, p_credits, 'purchase', p_token, p_description);

  UPDATE public.profiles
  SET credits = credits + p_credits
  WHERE id = p_user_id
  RETURNING credits INTO v_new_credits;

  RETURN v_new_credits;
END;
$$;

-- Unique constraint so duplicate PayPal callbacks can't double-credit.
-- Partial index: NULLs are excluded (usage transactions have no token).
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_transactions_stripe_session_id_unique
  ON public.credit_transactions(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- Fix over-permissive RLS. Old policies used WITH CHECK (true), which allows
-- any authenticated user to insert — not just the service role.
DROP POLICY IF EXISTS "Service role can insert transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Service role can insert usage logs"   ON public.usage_logs;

CREATE POLICY "Service role can insert transactions"
  ON public.credit_transactions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can insert usage logs"
  ON public.usage_logs FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
