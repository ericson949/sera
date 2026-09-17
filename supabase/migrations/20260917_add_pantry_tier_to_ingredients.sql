-- supabase/migrations/20260917_add_pantry_tier_to_ingredients.sql
-- Ajout de la colonne pantryTier pour distinguer les ingrédients à acheter impérativement ('specific'),
-- les basiques du placard ('staple'), et les assaisonnements/épices universels ('seasoning').

ALTER TABLE public.ingredients_reference
  ADD COLUMN IF NOT EXISTS "pantryTier" VARCHAR NOT NULL DEFAULT 'staple'
  CHECK ("pantryTier" IN ('specific', 'staple', 'seasoning'));

-- 1. Ingrédients frais ou spécifiques (Produce, Butcher, Seafood, Bakery, Dairy)
UPDATE public.ingredients_reference
SET "pantryTier" = 'specific'
WHERE category IN ('Produce', 'Butcher', 'Seafood', 'Bakery', 'Dairy & Alternatives');

-- 2. Épices, assaisonnements universels
UPDATE public.ingredients_reference
SET "pantryTier" = 'seasoning'
WHERE category = 'Pantry - Spices & Baking'
   OR id IN ('ing_salt', 'ing_cooking_salt', 'ing_black_pepper', 'ing_pepper', 'ing_water');

-- 3. Basiques de placard (Staples, Grains, Sauces, Huiles)
UPDATE public.ingredients_reference
SET "pantryTier" = 'staple'
WHERE category IN ('Pantry - Staples & Grains', 'Pantry - Condiments & Sauces', 'Other')
  AND id NOT IN ('ing_salt', 'ing_cooking_salt', 'ing_black_pepper', 'ing_pepper', 'ing_water');

-- Index d'optimisation pour filtrage par palier et catégorie
CREATE INDEX IF NOT EXISTS idx_ingredients_reference_pantry_tier
  ON public.ingredients_reference ("pantryTier", category);
