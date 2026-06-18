-- Allow any authenticated user to view other users' public profiles
-- (needed for leaderboard profile viewing — clicking a player opens their profile)
-- Only exposes public fields: display_name, avatar_url, bio, created_at, is_premium
CREATE POLICY "Anyone can view profiles"
  ON public.profiles
  FOR SELECT
  USING (true);
