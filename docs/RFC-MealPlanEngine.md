# RFC - Analyse détaillée et optimisée du MealPlanEngine

Ce document présente une analyse approfondie du moteur de génération de plans de repas hebdomadaires (`MealPlanEngine`) de Sera.

---

## 1. Architecture & Types

Le module définit un modèle de données cohérent avec 8 interfaces et 1 classe. La `Map` `ingredientRefById` permet un lookup O(1) sur les ingrédients — excellent choix de structure.

---

## 2. Algorithme principal `generatePlan()`

**Pipeline en 4 étapes :**

| Étape | Action | Complexité |
|-------|--------|-----------|
| 1 | Filtrage strict (temps, diet, allergènes) | O(R) |
| 2 | Calcul des coûts scalés par recette | O(R × I) |
| 3 | Scoring + tri décroissant | O(R log R) |
| 4 | Recherche par pools (30 → 50 → 80) | Limité à 5000 nœuds |

Le **scoring** combine : `ratings + vibeBonus(0.5) ± jitter(0.2)`. Le jitter aléatoire évite la monotonie mais rend les résultats non reproductibles.

---

## 3. Le cœur : `findBestUnderBudgetPlan()`

**Backtracking optimisé** avec deux idées clés :

### Calcul incrémental du coût
Au lieu de recalculer le coût total à chaque nœud, le code maintient `currentQuantities` et `currentCost`. Quand on ajoute un repas, on calcule uniquement la **différence de paquets** (`ceil` avant vs après). C'est l'optimisation la plus intelligente du code.

### Sélection du "meilleur" plan
Parmi les plans valides (≤ 30 collectés), on choisit celui qui **minimise le nombre d'ingrédients uniques à acheter**. C'est un critère UX excellent : moins de courses, moins de gaspillage.

---

## 4. Points forts ✅

- **Sécurité allergènes** : filtrage strict sans compromis.
- **Regroupement d'ingrédients** : un ingrédient partagé entre repas = un seul achat (avec `Math.ceil` implicite lié à la normalisation du seed).
- **Garde-manger** : les ingrédients déjà en stock (`knownPantryItems`) coûtent 0 et sont exclus de la liste de courses.
- **Garde-fous** : `maxNodes = 5000` et pool max de 80 recettes éliminent tout risque de blocage CPU ou de timeout serveur en production.
- **Fallback** : si le budget est impossible, on prend les 7 repas les moins chers.

---

## 5. Points de vigilance ⚠️

| Point de vigilance | Détail |
|--------------------|--------|
| **Filtre diet trop strict** | `every()` exige que la recette ait **toutes** les restrictions de l'utilisateur. Si l'utilisateur est "vegan + gluten-free", une recette juste "vegan" est rejetée. |
| **Non-déterminisme** | Le `shuffle()` (Fisher-Yates) + `Math.random()` dans le score font que deux appels identiques donnent des résultats différents (généralement voulu pour la variété). |
| **Exploration très limitée** | 5000 nœuds sur C(80,7) ≈ 3.1 milliards = 0.00016% de l'espace exploré. |
| **Pas de diversité forcée** | Risque d'obtenir des repas trop similaires ou redondants dans la même semaine. |
| **7 repas figés** | Pas configurable, pas de notion de repas/jour (petit-déj/déj/dîner). |
| **`calculatePlanCheckoutCost` redondante** | Recalcule tout ce que le backtracking a déjà calculé incrémentalement. |

---

## 6. Verdict et Perspectives

C'est un **MVP solide** avec une logique métier bien pensée (regroupement d'ingrédients, minimisation des courses, fallback budgétaire). Les principales évolutions à envisager pour le futur sont :
1. La **configurabilité** (nombre de repas, seed aléatoire pour le débogage).
2. La **clarification du filtre diététique** (gérer la compatibilité des régimes).
3. Une **diversification thématique** (éviter d'avoir trop de pâtes ou trop de poulet la même semaine en exploitant le champ `categories`).
