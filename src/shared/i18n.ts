import { AppLanguage } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";

type AppDictionary = {
  common: Record<"back" | "continue" | "start" | "selected", string>;
  welcome: Record<string, string>;
  pwaInstall: Record<"title" | "stepShare" | "stepThen" | "stepHome" | "dismiss", string>;
};

const dictionaries: Record<AppLanguage, AppDictionary> = {
  en: {
    common: {
      back: "Back",
      continue: "Continue",
      start: "Start planning",
      selected: "Selected",
    },
    welcome: {
      step: "Step",
      badge: "AI meal planning",
      page1Title: "Dinner planning that feels calm, not clinical.",
      page1Body:
        "Sera turns your budget, shop, tastes, and kitchen basics into a weekly dinner plan you can actually cook.",
      page1MetricA: "7 dinners",
      page1MetricB: "1 list",
      page1MetricC: "Less waste",
      page2Title: "Set your market and language.",
      page2Body:
        "We use your country to tune grocery assumptions and your language to shape the full experience.",
      country: "Country",
      language: "Language",
      page3Title: "A warmer way to stay on budget.",
      page3Body:
        "Get realistic dinners, grouped shopping lists, and simple swaps when a meal does not fit your week.",
      benefit1Title: "Budget-first dinners",
      benefit1Body: "Recipes are planned around your weekly range and household size.",
      benefit2Title: "Smarter shopping",
      benefit2Body: "Ingredients are grouped and reused so your cart stays focused.",
      benefit3Title: "Flexible by design",
      benefit3Body: "Swap meals and keep your plan moving without starting over.",
      savingsTitle: "Never wonder what's for dinner again.",
      savingsSubtitle: "Average Sera users save €57/month on groceries.",
      wrongCountry: "Wrong country? Change it anytime.",
      countryPickerClose: "Close",
      countryPickerChange: "Change",
      plannerTitle: "A full week. Planned in seconds.",
      plannerSubtitle: "Personalized around your budget and tastes.",
      listTitle: "One trip. Everything you need.",
      listSubtitle: "Smart shopping lists generated automatically.",
      timeBadge: "Takes less than 1 minute",
      startPlanning: "Start Planning",
    },
    pwaInstall: {
      title: "Install Sera on your iPhone",
      stepShare: "Tap Share",
      stepThen: "then",
      stepHome: "Add to Home Screen",
      dismiss: "Dismiss install guide",
    },
  },
  fr: {
    common: {
      back: "Retour",
      continue: "Continuer",
      start: "Commencer",
      selected: "Selectionne",
    },
    welcome: {
      step: "Etape",
      badge: "Planification IA",
      page1Title: "Planifier ses diners sans transformer la cuisine en tableur.",
      page1Body:
        "Sera transforme ton budget, ton magasin, tes envies et ce que tu as deja en cuisine en menu de diners realiste.",
      page1MetricA: "7 diners",
      page1MetricB: "1 liste",
      page1MetricC: "Moins de gaspillage",
      page2Title: "Choisis ton marche et ta langue.",
      page2Body:
        "Le pays ajuste les hypotheses de courses. La langue adapte l'experience a ton quotidien.",
      country: "Pays",
      language: "Langue",
      page3Title: "Une facon plus douce de tenir son budget.",
      page3Body:
        "Des diners realistes, une liste de courses groupee et des substitutions simples quand un plat ne colle pas a ta semaine.",
      benefit1Title: "Diners penses budget",
      benefit1Body: "Les recettes suivent ta fourchette hebdomadaire et le nombre de personnes.",
      benefit2Title: "Courses plus nettes",
      benefit2Body: "Les ingredients sont groupes et reutilises pour garder un panier clair.",
      benefit3Title: "Flexible par nature",
      benefit3Body: "Remplace un repas sans devoir recommencer tout le planning.",
      savingsTitle: "Ne te demande plus jamais quoi manger ce soir.",
      savingsSubtitle: "Les utilisateurs Sera economisent en moyenne 57 €/mois sur les courses.",
      wrongCountry: "Mauvais pays ? Tu peux le changer a tout moment.",
      countryPickerClose: "Fermer",
      countryPickerChange: "Changer",
      plannerTitle: "Une semaine complete. Planifiee en quelques secondes.",
      plannerSubtitle: "Personnalisee selon ton budget et tes gouts.",
      listTitle: "Une sortie courses. Tout ce qu'il faut.",
      listSubtitle: "Des listes intelligentes generees automatiquement.",
      timeBadge: "Prend moins d'une minute",
      startPlanning: "Commencer",
    },
    pwaInstall: {
      title: "Installe Sera sur ton iPhone",
      stepShare: "Touche Partager",
      stepThen: "puis",
      stepHome: "Ajouter a l'ecran d'accueil",
      dismiss: "Fermer le guide d'installation",
    },
  },
  it: {
    common: {
      back: "Indietro",
      continue: "Continua",
      start: "Inizia a pianificare",
      selected: "Selezionato",
    },
    welcome: {
      step: "Passo",
      badge: "Meal planning AI",
      page1Title: "Pianifica le cene senza trasformare la cucina in un foglio di calcolo.",
      page1Body:
        "Sera trasforma budget, supermercato, gusti e dispensa in un menu settimanale realistico.",
      page1MetricA: "7 cene",
      page1MetricB: "1 lista",
      page1MetricC: "Meno sprechi",
      page2Title: "Imposta mercato e lingua.",
      page2Body:
        "Usiamo il paese per adattare le stime della spesa e la lingua per rendere l'esperienza naturale.",
      country: "Paese",
      language: "Lingua",
      page3Title: "Un modo piu caldo per restare nel budget.",
      page3Body:
        "Cene realistiche, lista della spesa raggruppata e cambi pasto semplici quando la settimana cambia.",
      benefit1Title: "Cene orientate al budget",
      benefit1Body: "Le ricette seguono il range settimanale e il numero di persone.",
      benefit2Title: "Spesa piu intelligente",
      benefit2Body: "Gli ingredienti vengono raggruppati e riutilizzati per evitare sprechi.",
      benefit3Title: "Flessibile per natura",
      benefit3Body: "Cambia un pasto senza ricominciare tutto il piano.",
      savingsTitle: "Non chiederti piu cosa cucinare per cena.",
      savingsSubtitle: "Gli utenti Sera risparmiano in media 57 €/mese sulla spesa.",
      wrongCountry: "Paese sbagliato? Puoi cambiarlo quando vuoi.",
      countryPickerClose: "Chiudi",
      countryPickerChange: "Cambia",
      plannerTitle: "Una settimana intera. Pianificata in pochi secondi.",
      plannerSubtitle: "Personalizzata in base a budget e gusti.",
      listTitle: "Una sola spesa. Tutto cio che serve.",
      listSubtitle: "Liste intelligenti generate automaticamente.",
      timeBadge: "Richiede meno di 1 minuto",
      startPlanning: "Inizia",
    },
    pwaInstall: {
      title: "Installa Sera sul tuo iPhone",
      stepShare: "Tocca Condividi",
      stepThen: "poi",
      stepHome: "Aggiungi alla schermata Home",
      dismiss: "Chiudi la guida di installazione",
    },
  },
};

export type Dictionary = AppDictionary;

export function getCopy(language: AppLanguage): Dictionary {
  return dictionaries[language] ?? dictionaries.en;
}
