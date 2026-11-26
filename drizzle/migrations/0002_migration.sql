CREATE OR REPLACE FUNCTION public.market_buy(_id uuid)
RETURNS public.market_listings
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE r public.market_listings; sv jsonb; slot int; g numeric;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  SELECT data INTO sv FROM public.game_saves WHERE user_id = auth.uid() FOR UPDATE;
  IF sv IS NULL OR jsonb_typeof(sv->'slots') <> 'array' THEN RAISE EXCEPTION 'Save your game before buying'; END IF;
  slot := COALESCE((sv->>'active')::int, 0);
  g := COALESCE((sv->'slots'->slot->>'gold')::numeric, 0);
  SELECT * INTO r FROM public.market_listings WHERE id = _id AND status = 'open' AND seller_id <> auth.uid() FOR UPDATE;
  IF r.id IS NULL THEN RAISE EXCEPTION 'This listing is no longer available'; END IF;
  IF g < r.price THEN RAISE EXCEPTION 'Not enough gold'; END IF;
  UPDATE public.game_saves
     SET data = jsonb_set(sv, ARRAY['slots', slot::text, 'gold'], to_jsonb(g - r.price)), updated_at = now()
   WHERE user_id = auth.uid();
  UPDATE public.market_listings
     SET status = 'sold', buyer_id = auth.uid(), sold_at = now()
   WHERE id = _id
  RETURNING * INTO r;
  RETURN r;
END $$;
REVOKE EXECUTE ON FUNCTION public.market_buy(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.market_buy(uuid) TO authenticated;