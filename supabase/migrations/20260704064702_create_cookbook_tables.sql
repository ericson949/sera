-- supabase/migrations/<timestamp>_create_cookbook_tables.sql

CREATE TABLE public.ingredients_reference (
  id VARCHAR PRIMARY KEY,
  category VARCHAR NOT NULL,
  translations JSONB NOT NULL,
  "estimatedPricePerUnit" JSONB NOT NULL
);

CREATE TABLE public.recipes (
  id VARCHAR PRIMARY KEY,
  language VARCHAR NOT NULL,
  country VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  "imageUrl" VARCHAR,
  "prepTime" INTEGER NOT NULL,
  "cookTime" INTEGER NOT NULL,
  "totalTime" INTEGER NOT NULL,
  "defaultServings" INTEGER NOT NULL,
  ingredients JSONB NOT NULL,
  "ingredientGroups" JSONB,
  steps JSONB NOT NULL,
  allergens JSONB,
  diet JSONB,
  taxonomy JSONB
);

-- Activation des politiques RLS
ALTER TABLE public.ingredients_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.ingredients_reference FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.recipes FOR SELECT USING (true);