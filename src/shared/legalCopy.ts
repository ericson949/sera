import { AppLanguage } from "@/modules/meal-planning/presentation/hooks/useDinneroStore";

type LegalDoc = { title: string; intro: string; sections: { title: string; body: string }[] };

export const LEGAL_COPY: Record<AppLanguage, Record<"privacy" | "terms" | "cancellation", LegalDoc>> = {
  en: {
    privacy: {
      title: "Privacy Policy",
      intro: "Sera keeps the product simple: we collect only what is needed to plan meals, manage accounts and process payments.",
      sections: [
        { title: "Data we use", body: "Preferences, generated meal plans, shopping lists, email, subscription status and basic device information for PWA reliability." },
        { title: "Payments", body: "Lemon Squeezy processes payment details. Sera does not store card numbers." },
        { title: "AI generation", body: "Meal planning inputs can be sent to our AI provider to generate recipes and shopping lists." },
        { title: "Your choices", body: "You can request deletion or correction of your account data by contacting support." },
      ],
    },
    terms: {
      title: "Terms of Service",
      intro: "By using Sera, you agree to use it as a planning assistant, not as medical, nutritional or financial advice.",
      sections: [
        { title: "Service", body: "Sera provides dinner plans, recipe suggestions, estimated grocery costs and shopping lists." },
        { title: "Estimates", body: "Prices and nutrition are estimates. Always verify labels, allergens and store prices before purchasing or cooking." },
        { title: "Subscription", body: "Premium access unlocks higher limits and paid features billed through Lemon Squeezy." },
        { title: "Availability", body: "We may change, pause or improve features as the product evolves." },
      ],
    },
    cancellation: {
      title: "Cancellation Policy",
      intro: "Sera subscriptions are designed to be easy to leave.",
      sections: [
        { title: "Cancel anytime", body: "You can cancel online from the subscription or billing flow. Access remains until the end of the paid period." },
        { title: "Renewal", body: "Monthly subscriptions renew automatically unless cancelled before the next billing date." },
        { title: "Refunds", body: "Refund requests are reviewed case by case where required by consumer law or payment rules." },
      ],
    },
  },
  fr: {
    privacy: {
      title: "Politique de confidentialite",
      intro: "Sera collecte uniquement ce qui est necessaire pour planifier les repas, gerer le compte et traiter les paiements.",
      sections: [
        { title: "Donnees utilisees", body: "Preferences, plans generes, listes de courses, email, statut d'abonnement et donnees techniques utiles a la PWA." },
        { title: "Paiements", body: "Lemon Squeezy traite les donnees de paiement. Sera ne stocke pas les numeros de carte." },
        { title: "Generation IA", body: "Les preferences de planification peuvent etre envoyees a notre fournisseur IA pour generer recettes et listes." },
        { title: "Tes choix", body: "Tu peux demander la suppression ou correction de tes donnees en contactant le support." },
      ],
    },
    terms: {
      title: "Conditions d'utilisation",
      intro: "En utilisant Sera, tu acceptes de l'utiliser comme assistant de planification, pas comme conseil medical, nutritionnel ou financier.",
      sections: [
        { title: "Service", body: "Sera fournit des menus, suggestions de recettes, estimations de courses et listes d'achat." },
        { title: "Estimations", body: "Prix et nutrition sont indicatifs. Verifie toujours etiquettes, allergenes et prix magasin." },
        { title: "Abonnement", body: "L'acces Premium debloque plus de limites et fonctions payantes facturees par Lemon Squeezy." },
        { title: "Disponibilite", body: "Les fonctionnalites peuvent evoluer, etre suspendues ou ameliorees." },
      ],
    },
    cancellation: {
      title: "Politique d'annulation",
      intro: "Les abonnements Sera sont concus pour etre faciles a quitter.",
      sections: [
        { title: "Annulation a tout moment", body: "Tu peux annuler en ligne depuis le parcours abonnement/facturation. L'acces reste actif jusqu'a la fin de la periode payee." },
        { title: "Renouvellement", body: "L'abonnement mensuel se renouvelle automatiquement sauf annulation avant la prochaine date de facturation." },
        { title: "Remboursements", body: "Les demandes sont analysees au cas par cas selon le droit consommateur et les regles de paiement applicables." },
      ],
    },
  },
  it: {
    privacy: {
      title: "Informativa privacy",
      intro: "Sera raccoglie solo cio che serve per pianificare i pasti, gestire l'account e trattare i pagamenti.",
      sections: [
        { title: "Dati usati", body: "Preferenze, piani generati, liste spesa, email, stato abbonamento e dati tecnici per la PWA." },
        { title: "Pagamenti", body: "Lemon Squeezy gestisce i dati di pagamento. Sera non conserva numeri di carta." },
        { title: "Generazione AI", body: "Gli input di pianificazione possono essere inviati al provider AI per generare ricette e liste." },
        { title: "Le tue scelte", body: "Puoi richiedere eliminazione o correzione dei dati contattando il supporto." },
      ],
    },
    terms: {
      title: "Termini di servizio",
      intro: "Usando Sera accetti di usarlo come assistente di pianificazione, non come consiglio medico, nutrizionale o finanziario.",
      sections: [
        { title: "Servizio", body: "Sera offre menu, ricette, stime di spesa e liste acquisti." },
        { title: "Stime", body: "Prezzi e nutrizione sono stime. Verifica sempre etichette, allergeni e prezzi del negozio." },
        { title: "Abbonamento", body: "Premium sblocca limiti maggiori e funzioni a pagamento gestite da Lemon Squeezy." },
        { title: "Disponibilita", body: "Le funzionalita possono cambiare, essere sospese o migliorate." },
      ],
    },
    cancellation: {
      title: "Politica di cancellazione",
      intro: "Gli abbonamenti Sera sono pensati per essere facili da lasciare.",
      sections: [
        { title: "Cancella quando vuoi", body: "Puoi cancellare online dal flusso abbonamento/fatturazione. L'accesso resta fino alla fine del periodo pagato." },
        { title: "Rinnovo", body: "L'abbonamento mensile si rinnova automaticamente salvo cancellazione prima della prossima data di fatturazione." },
        { title: "Rimborsi", body: "Le richieste sono valutate caso per caso secondo normativa consumatori e regole di pagamento." },
      ],
    },
  },
};

export function getLegalCopy(language: AppLanguage) {
  return LEGAL_COPY[language] ?? LEGAL_COPY.en;
}
