import { AppLanguage } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";

export const PRODUCT_COPY = {
  en: {
    nav: ["Casa", "Journal", "Market", "Pro"],
    common: { back: "Back", close: "Close", swap: "Swap", continue: "Continue with Sera" },
    dashboard: {
      statusFree: "Free", statusPro: "Pro", kicker: "Italian dinner journal",
      title: "A quieter way to plan the week.", compose: "Compose", newWeek: "New week",
      current: "Current journal", noPlan: "No plan", week: "This week", dinners: "dinners",
      market: "market", saved: "saved", empty: "Start with a few preferences. Sera will turn them into a full dinner week.",
      marketKicker: "Market", shoppingGuide: "Shopping guide",
    },
    results: {
      emptyKicker: "Sera Journal", emptyTitle: "Your table is still empty.",
      emptyBody: "Begin with your tastes and budget. Sera will compose the week.", start: "Start planning",
      loadingTitle: "Composing your week.", loadingBody: "A calmer menu is being assembled.",
      journal: "Sera weekly journal", title: "Dinner, curated.", guest: "guest", guests: "guests",
      estimated: "Estimated market", budget: "Budget", inRange: "In range", watch: "Watch list",
      marketList: "Market list", regenerate: "Regenerate menu", save: "Save plan", evenings: "Seven evenings",
    },
    shopping: {
      emptyTitle: "No market list yet.", emptyBody: "Create a weekly plan and Sera will arrange your ingredients by market section.",
      compose: "Compose the week", guide: "Sera market guide", titleA: "One trip.", titleB: "Everything needed.",
      gathered: "gathered", collected: "Collected", remaining: "Remaining", total: "Total",
      exported: "Exported", export: "Export", tryAgain: "Try again", clear: "Clear", all: "All", items: "items",
      exportTitle: "Sera market list", estimatedTotal: "Estimated total",
    },
    pricing: {
      kicker: "Sera membership", title: "A more graceful kitchen rhythm.", active: "Active", monthly: "Monthly",
      cancel: "Cancel online whenever the season changes.", member: "Member", pro: "Pro", pause: "Sandbox: pause membership",
      unlock: "Sandbox: unlock membership", stripe: "Payments are processed by Stripe. By continuing, you agree to the terms and cancellation policy.",
      links: "Privacy, terms and cancellation", features: ["Unlimited weekly dinner journals", "Unlimited meal swaps", "Saved menus and favourite recipes", "Exportable market guide", "Budget history for calmer shopping", "Family portions and pantry-aware planning"],
    },
    meal: { time: "Time", energy: "Energy", cost: "Cost", why: "Why it belongs here", ingredients: "Ingredients", method: "Method" },
    paywall: {
      kicker: "Sera membership", title: "Keep the week beautifully planned.",
      body: "Designed for households that want a calmer table, a clearer market list, and fewer last-minute decisions.",
      perMonth: "/ month", unlock: "Sandbox: unlock membership",
      benefits: ["Unlimited weekly dinner journals", "Unlimited refined meal swaps", "Saved menus for future Sundays", "Exportable market lists"],
    },
    notifications: {
      kicker: "Notifications", on: "Dinner reminders are on.", off: "Let Sera remind you.",
      blocked: "Notifications are blocked in your browser settings.", body: "Get a quiet nudge when your weekly market guide is ready.",
      disable: "Disable notifications", enable: "Enable notifications",
    },
  },
  fr: {
    nav: ["Casa", "Journal", "Marche", "Pro"],
    common: { back: "Retour", close: "Fermer", swap: "Remplacer", continue: "Continuer avec Sera" },
    dashboard: {
      statusFree: "Gratuit", statusPro: "Pro", kicker: "Journal de diners italien",
      title: "Une facon plus calme de planifier la semaine.", compose: "Composer", newWeek: "Nouvelle semaine",
      current: "Journal actuel", noPlan: "Aucun plan", week: "Cette semaine", dinners: "diners",
      market: "courses", saved: "sauves", empty: "Commence par quelques preferences. Sera les transforme en semaine de diners.",
      marketKicker: "Marche", shoppingGuide: "Guide courses",
    },
    results: {
      emptyKicker: "Journal Sera", emptyTitle: "Ta table est encore vide.",
      emptyBody: "Commence par tes gouts et ton budget. Sera compose la semaine.", start: "Commencer",
      loadingTitle: "Composition de ta semaine.", loadingBody: "Un menu plus calme est en preparation.",
      journal: "Journal hebdomadaire Sera", title: "Diners, selectionnes.", guest: "personne", guests: "personnes",
      estimated: "Courses estimees", budget: "Budget", inRange: "Dans la fourchette", watch: "A surveiller",
      marketList: "Liste courses", regenerate: "Regenerer le menu", save: "Sauver le plan", evenings: "Sept soirs",
    },
    shopping: {
      emptyTitle: "Pas encore de liste courses.", emptyBody: "Cree une semaine et Sera classera tes ingredients par rayon.",
      compose: "Composer la semaine", guide: "Guide marche Sera", titleA: "Une sortie.", titleB: "Tout ce qu'il faut.",
      gathered: "pris", collected: "Pris", remaining: "Restant", total: "Total",
      exported: "Exporte", export: "Exporter", tryAgain: "Reessayer", clear: "Vider", all: "Tout", items: "articles",
      exportTitle: "Liste courses Sera", estimatedTotal: "Total estime",
    },
    pricing: {
      kicker: "Abonnement Sera", title: "Un rythme cuisine plus elegant.", active: "Actif", monthly: "Mensuel",
      cancel: "Annule en ligne a tout moment.", member: "Membre", pro: "Pro", pause: "Sandbox: suspendre",
      unlock: "Sandbox: debloquer", stripe: "Paiements traites par Stripe. En continuant, tu acceptes les conditions et la politique d'annulation.",
      links: "Confidentialite, conditions et annulation", features: ["Semaines de diners illimitees", "Remplacements illimites", "Menus sauvegardes", "Guide courses exportable", "Historique budget", "Portions famille et placard pris en compte"],
    },
    meal: { time: "Temps", energy: "Energie", cost: "Cout", why: "Pourquoi ce plat", ingredients: "Ingredients", method: "Methode" },
    paywall: {
      kicker: "Abonnement Sera", title: "Garde la semaine joliment planifiee.",
      body: "Pour les foyers qui veulent une table plus calme, une liste plus claire et moins de decisions de derniere minute.",
      perMonth: "/ mois", unlock: "Sandbox: debloquer",
      benefits: ["Semaines de diners illimitees", "Remplacements raffines illimites", "Menus sauvegardes", "Listes courses exportables"],
    },
    notifications: {
      kicker: "Notifications", on: "Les rappels diner sont actifs.", off: "Laisse Sera te le rappeler.",
      blocked: "Les notifications sont bloquees dans ton navigateur.", body: "Recois un rappel discret quand ton guide courses est pret.",
      disable: "Desactiver les notifications", enable: "Activer les notifications",
    },
  },
  it: {
    nav: ["Casa", "Diario", "Mercato", "Pro"],
    common: { back: "Indietro", close: "Chiudi", swap: "Cambia", continue: "Continua con Sera" },
    dashboard: {
      statusFree: "Gratis", statusPro: "Pro", kicker: "Diario italiano della cena",
      title: "Un modo piu calmo per pianificare la settimana.", compose: "Componi", newWeek: "Nuova settimana",
      current: "Diario attuale", noPlan: "Nessun piano", week: "Questa settimana", dinners: "cene",
      market: "spesa", saved: "salvati", empty: "Inizia con poche preferenze. Sera le trasforma in una settimana di cene.",
      marketKicker: "Mercato", shoppingGuide: "Guida spesa",
    },
    results: {
      emptyKicker: "Diario Sera", emptyTitle: "La tua tavola e ancora vuota.",
      emptyBody: "Parti da gusti e budget. Sera compone la settimana.", start: "Inizia",
      loadingTitle: "Composizione della settimana.", loadingBody: "Un menu piu calmo sta prendendo forma.",
      journal: "Diario settimanale Sera", title: "Cene curate.", guest: "persona", guests: "persone",
      estimated: "Spesa stimata", budget: "Budget", inRange: "Nel range", watch: "Da controllare",
      marketList: "Lista spesa", regenerate: "Rigenera menu", save: "Salva piano", evenings: "Sette sere",
    },
    shopping: {
      emptyTitle: "Nessuna lista spesa.", emptyBody: "Crea una settimana e Sera ordinera gli ingredienti per reparto.",
      compose: "Componi la settimana", guide: "Guida mercato Sera", titleA: "Una spesa.", titleB: "Tutto cio che serve.",
      gathered: "presi", collected: "Presi", remaining: "Restante", total: "Totale",
      exported: "Esportata", export: "Esporta", tryAgain: "Riprova", clear: "Svuota", all: "Tutto", items: "articoli",
      exportTitle: "Lista spesa Sera", estimatedTotal: "Totale stimato",
    },
    pricing: {
      kicker: "Abbonamento Sera", title: "Un ritmo in cucina piu elegante.", active: "Attivo", monthly: "Mensile",
      cancel: "Annulla online quando vuoi.", member: "Membro", pro: "Pro", pause: "Sandbox: sospendi",
      unlock: "Sandbox: sblocca", stripe: "Pagamenti gestiti da Stripe. Continuando accetti termini e cancellazione.",
      links: "Privacy, termini e cancellazione", features: ["Diari settimanali illimitati", "Cambi pasto illimitati", "Menu salvati", "Guida spesa esportabile", "Storico budget", "Porzioni famiglia e dispensa"],
    },
    meal: { time: "Tempo", energy: "Energia", cost: "Costo", why: "Perche questo piatto", ingredients: "Ingredienti", method: "Metodo" },
    paywall: {
      kicker: "Abbonamento Sera", title: "Mantieni la settimana ben pianificata.",
      body: "Per famiglie che vogliono una tavola piu calma, una lista piu chiara e meno decisioni all'ultimo minuto.",
      perMonth: "/ mese", unlock: "Sandbox: sblocca",
      benefits: ["Diari settimanali illimitati", "Cambi raffinati illimitati", "Menu salvati", "Liste spesa esportabili"],
    },
    notifications: {
      kicker: "Notifiche", on: "Promemoria cena attivi.", off: "Lascia che Sera te lo ricordi.",
      blocked: "Le notifiche sono bloccate nel browser.", body: "Ricevi un promemoria discreto quando la guida spesa e pronta.",
      disable: "Disattiva notifiche", enable: "Attiva notifiche",
    },
  },
} as const;

export function getProductCopy(language: AppLanguage) {
  return PRODUCT_COPY[language] ?? PRODUCT_COPY.en;
}
