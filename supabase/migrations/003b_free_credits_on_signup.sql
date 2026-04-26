-- Update the handle_new_user function to give 25 free credits on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile with 25 free credits
  INSERT INTO public.profiles (id, email, full_name, credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    25  -- 25 free credits on signup (enough to try analysis + rewrite + export)
  );

  -- Log the welcome bonus transaction
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (
    NEW.id,
    25,
    'purchase',
    'Welcome bonus - 25 free credits'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
