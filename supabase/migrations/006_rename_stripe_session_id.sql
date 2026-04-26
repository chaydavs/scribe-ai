-- Rename stripe_session_id to paypal_order_id for accuracy
ALTER TABLE public.credit_transactions
  RENAME COLUMN stripe_session_id TO paypal_order_id;

-- Drop the old unique index (it references the old column name)
DROP INDEX IF EXISTS idx_credit_transactions_stripe_session_id_unique;

-- Recreate it with the new column name
CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_transactions_paypal_order_id_unique
  ON public.credit_transactions(paypal_order_id)
  WHERE paypal_order_id IS NOT NULL;

-- Update the add_credits_for_purchase function to use new column name
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
  INSERT INTO public.credit_transactions (user_id, amount, type, paypal_order_id, description)
  VALUES (p_user_id, p_credits, 'purchase', p_token, p_description);

  UPDATE public.profiles
  SET credits = credits + p_credits
  WHERE id = p_user_id
  RETURNING credits INTO v_new_credits;

  RETURN v_new_credits;
END;
$$;
