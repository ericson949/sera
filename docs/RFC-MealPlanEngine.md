# RFC - Analyse détaillée du MealPlanEngine

Ce document présente une analyse approfondie du moteur de planification des repas hebdomadaires (`MealPlanEngine`) de Sera.

---

## 1. Vue d’ensemble

Le moteur `MealPlanEngine` génère un plan de repas hebdomadaire (7 recettes) sous contrainte de budget, avec des filtres stricts (temps de cuisson, restrictions alimentaires, allergènes) et une recherche optimisée par backtracking.
Il vise à **respecter un budget hebdomadaire tout en minimisant le nombre d’ingrédients différents à acheter** (cross-utilization).

---

## 2. Types et interfaces

| Type / Interface | Rôle |
|------------------|------|
| `Category` | Catégorisation des ingrédients par rayons de magasin. |
| `UserPreferences` | Contraintes utilisateur (budget, régime, allergènes, pantry, vibes). |
| `Recipe` | Modèle de recette : ingrédients, temps, régimes, allergènes, vibes. |
| `RecipeIngredient` | Quantité et unité pour un ingrédient au sein d'une recette. |
| `IngredientRef` | Référence d'ingrédient en base avec son prix unitaire et son unité. |
| `ScaledIngredient` | Ingrédient mis à l'échelle pour un repas, avec coût estimé. |
| `PlannedMeal` | Repas planifié : recette originale scalée, coûts et notes. |
| `GeneratedPlan` | Résultat final du plan hebdomadaire de 7 repas. |

---

## 3. Algorithme de génération (`generatePlan`)

### 3.1 Pré-filtrage strict
Élimine les recettes ne correspondant pas aux critères absolus :
- `totalTime > cookingTimeLimit`
- Régimes non respectés (`dietaryRestrictions`)
- Présence d'allergènes (`allergens`)

### 3.2 Tri avec Jitter et Priorités
Les repas candidats sont ordonnés selon leur note (`ratings`), additionnés d'un léger bruit aléatoire (jitter de $\pm0.2$ étoiles) afin de varier les propositions d'une génération à l'autre tout en préservant le critère de qualité supérieure.

### 3.3 Backtracking Incrémental et Sélection
La recherche se fait par backtracking récursif sur des pools de taille croissante (top 30 → top 50 → top 80 candidats max) :
- **Calcul incrémental du coût** : Le coût du panier est maintenu dynamiquement à chaque insertion/retrait d'un repas ($O(I)$ par nœud), évitant la complexité de recalcul complet.
- **Sécurité et performance** : La recherche est limitée à 5 000 nœuds visités pour empêcher tout timeout serveur.
- **Optimisation de la liste de courses** : L'algorithme collecte jusqu'à 30 plans valides et sélectionne celui ayant le **nombre minimal d'ingrédients uniques à acheter**, favorisant le partage d'ingrédients communs (cross-utilization).

---

## 4. Forces du système

- **Modélisation réaliste du panier** : Prise en compte de l'arrondi au paquet entier (`Math.ceil`) pour simuler le passage réel en caisse.
- **Minimisation du gaspillage** : Priorisation automatique des combinaisons de repas partageant des ingrédients.
- **Robustesse et rapidité** : Grâce au capping des pools de recherche à 80 et au calcul de coût incrémental, la génération s'effectue en moins de 10 ms sans risque de freeze CPU.
- **Mélange équitable** : Utilisation du mélange Fisher-Yates pour une variété saine.

---

## 5. Axes d'amélioration futurs

1. **Conditionnement (`packageSize`)** :
   Actuellement, l'arrondi se fait à l'unité (`Math.ceil(quantity)`). L'introduction d'un paramètre `packageSize` (ex: sachet d'épinards de 250g) permettrait un calcul encore plus réaliste.
2. **Prise en compte des Vibes** :
   Intégrer les préférences de thématiques ou de types de cuisines (`vibes`) comme un bonus de score de tri dynamique lors de la génération.
3. **Hiérarchie de filtrage des régimes** :
   Rendre le filtrage des régimes alimentaires plus souple (ex: une recette vegan est par définition végétarienne).
