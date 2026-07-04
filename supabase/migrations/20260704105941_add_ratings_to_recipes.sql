-- supabase/migrations/20260704105941_add_ratings_to_recipes.sql
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS ratings NUMERIC DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "ratingsCount" INTEGER DEFAULT 0;
