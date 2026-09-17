export type PantryTier = "specific" | "staple" | "seasoning";

export const PANTRY_TIERS: readonly PantryTier[] = ["specific", "staple", "seasoning"] as const;

export function isSeasoning(tier?: PantryTier | string): boolean {
  return tier === "seasoning";
}

export function isStaple(tier?: PantryTier | string): boolean {
  return tier === "staple";
}

export function isSpecific(tier?: PantryTier | string): boolean {
  return tier === "specific";
}

/**
 * Heuristique d'inférence de tier pour les ingrédients non qualifiés (ex: scraping Marmiton brut ou ingestion directe)
 */
export function inferPantryTier(category?: string, nameOrId?: string): PantryTier {
  const identifier = (nameOrId || "").toLowerCase().replace(/^ing_/, "");
  const cat = (category || "").toLowerCase();

  // 1. Assaisonnements et épices universels
  if (
    identifier.includes("salt") ||
    identifier.includes("sel") ||
    identifier.includes("sale") ||
    identifier.includes("pepper") ||
    identifier.includes("poivre") ||
    identifier.includes("pepe") ||
    identifier.includes("paprika") ||
    identifier.includes("cumin") ||
    identifier.includes("curry") ||
    identifier.includes("oregano") ||
    identifier.includes("origan") ||
    identifier.includes("thyme") ||
    identifier.includes("thym") ||
    identifier.includes("cinnamon") ||
    identifier.includes("cannelle") ||
    identifier.includes("muscade") ||
    identifier.includes("nutmeg") ||
    identifier.includes("laurier") ||
    identifier.includes("bay_leaf") ||
    identifier.includes("water") ||
    identifier.includes("eau") ||
    cat.includes("spice") ||
    cat.includes("épice") ||
    cat.includes("spezie")
  ) {
    return "seasoning";
  }

  // 2. Basiques du placard (huiles, pâtes, riz, sauces de base, vinaigre, farine, etc.)
  if (
    cat.includes("staple") ||
    cat.includes("grain") ||
    cat.includes("condiment") ||
    cat.includes("sauce") ||
    identifier.includes("oil") ||
    identifier.includes("huile") ||
    identifier.includes("olio") ||
    identifier.includes("vinegar") ||
    identifier.includes("vinaigre") ||
    identifier.includes("flour") ||
    identifier.includes("farine") ||
    identifier.includes("sugar") ||
    identifier.includes("sucre") ||
    identifier.includes("rice") ||
    identifier.includes("riz") ||
    identifier.includes("pasta") ||
    identifier.includes("pates") ||
    identifier.includes("pâtes") ||
    identifier.includes("butter") ||
    identifier.includes("beurre") ||
    identifier.includes("garlic") ||
    identifier.includes("ail") ||
    identifier.includes("onion") ||
    identifier.includes("oignon")
  ) {
    return "staple";
  }

  // 3. Spécifiques par défaut (viandes, poissons, légumes frais, produits laitiers)
  return "specific";
}
