CREATE TABLE public.market_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  seller_name text NOT NULL DEFAULT '',
  kind text NOT NULL CHECK (kind IN ('mat', 'gear', 'monster')),
  label text NOT NULL DEFAULT '',
  item jsonb NOT NULL,
  qty integer NOT NULL DEFAULT 1 CHECK (qty > 0),
  price bigint NOT NULL CHECK (price > 0),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'sold', 'cancelled')),
  buyer_id uuid,
  claimed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  sold_at timestamptz
);

GRANT SELECT, INSERT ON public.market_listings TO authenticated;
GRANT ALL ON public.market_listings TO service_role;

ALTER TABLE public.market_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "see open and own listings" ON public.market_listings
  FOR SELECT TO authenticated
  USING (status = 'open' OR seller_id = auth.uid() OR buyer_id = auth.uid());

CREATE POLICY "list own items" ON public.market_listings
  FOR INSERT TO authenticated
  WITH CHECK (seller_id = auth.uid() AND status = 'open' AND buyer_id IS NULL AND claimed = false AND sold_at IS NULL);

CREATE INDEX market_listings_open_idx ON public.market_listings (status, created_at DESC);
CREATE INDEX market_listings_seller_idx ON public.market_listings (seller_id, status);

-- Buying, cancelling and collecting go through these functions so each listing changes hands exactly once.
CREATE OR REPLACE FUNCTION public.market_buy(_id uuid)
RETURNS public.market_listings
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE r public.market_listings;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  UPDATE public.market_listings
     SET status = 'sold', buyer_id = auth.uid(), sold_at = now()
   WHERE id = _id AND status = 'open' AND seller_id <> auth.uid()
  RETURNING * INTO r;
  IF r.id IS NULL THEN RAISE EXCEPTION 'This listing is no longer available'; END IF;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.market_cancel(_id uuid)
RETURNS public.market_listings
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE r public.market_listings;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  UPDATE public.market_listings
     SET status = 'cancelled'
   WHERE id = _id AND status = 'open' AND seller_id = auth.uid()
  RETURNING * INTO r;
  IF r.id IS NULL THEN RAISE EXCEPTION 'This listing can no longer be withdrawn'; END IF;
  RETURN r;
END $$;

CREATE OR REPLACE FUNCTION public.market_claim()
RETURNS SETOF public.market_listings
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  RETURN QUERY
  UPDATE public.market_listings
     SET claimed = true
   WHERE seller_id = auth.uid() AND status = 'sold' AND claimed = false
  RETURNING *;
END $$;

REVOKE EXECUTE ON FUNCTION public.market_buy(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.market_cancel(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.market_claim() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.market_buy(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.market_cancel(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.market_claim() TO authenticated;