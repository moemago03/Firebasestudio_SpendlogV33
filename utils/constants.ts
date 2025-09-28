export const DEFAULT_CATEGORIES = [
    { id: 'cat-1', name: 'Alloggio', icon: 'hotel', color: '#FFC107' },
    { id: 'cat-2', name: 'Trasporti', icon: 'commute', color: '#03A9F4' },
    { id: 'cat-3', name: 'Cibo', icon: 'restaurant', color: '#4CAF50' },
    { id: 'cat-4', name: 'Attività', icon: 'local_activity', color: '#E91E63' },
    { id: 'cat-5', name: 'Shopping', icon: 'shopping_cart', color: '#9C27B0' },
    { id: 'cat-6', name: 'Varie', icon: 'receipt_long', color: '#795548' },
];

export const CATEGORY_ICONS = ['hotel', 'commute', 'restaurant', 'local_activity', 'shopping_cart', 'receipt_long'];

export const ADJUSTMENT_CATEGORY = 'Saldo';

export const COUNTRY_TO_CODE: { [key: string]: string } = {
    // Aggiungi qui altre mappature
    'Italia': 'IT',
    'Spagna': 'ES',
    'Francia': 'FR',
    'Germania': 'DE',
    'Regno Unito': 'GB',
    'Stati Uniti': 'US',
};

export const FLAG_SVGS: { [key: string]: string } = {
    // Aggiungi qui altre mappature se necessario
};

export const STAGE_COLORS = ["#4285F4", "#DB4437", "#F4B400", "#0F9D58", "#9C27B0", "#E91E63", "#00BCD4", "#FF9800"];

export const TRAVEL_INFO_DATA: { [key: string]: { visaInfo: string; healthInfo: string; safetyTips: string[] } } = {
    'Italia': { visaInfo: 'Nessun visto richiesto per soggiorni turistici.', healthInfo: 'Nessuna vaccinazione obbligatoria.', safetyTips: ['Attenzione ai borseggiatori nelle zone turistiche.'] },
    'Spagna': { visaInfo: 'Nessun visto richiesto per soggiorni turistici.', healthInfo: 'Nessuna vaccinazione obbligatoria.', safetyTips: ['Non lasciare oggetti di valore incustoditi in spiaggia.'] },
};

export const VIAGGIARE_SICURI_COUNTRY_SLUGS: { [key: string]: string } = {
    'Italia': 'italia',
    'Spagna': 'spagna',
    'Francia': 'francia',
    'Germania': 'germania',
    'Regno Unito': 'regno-unito',
    'Stati Uniti': 'stati-uniti-d-america',
};

export const ALL_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD'];

export const CHECKLIST_TEMPLATES: { [key: string]: { icon: string; items: { title: string; category: string }[] } } = {
    'Essenziali': {
        icon: 'luggage',
        items: [
            { title: 'Passaporto', category: 'Documenti' },
            { title: 'Visto (se necessario)', category: 'Documenti' },
            { title: 'Biglietti aerei/treno', category: 'Trasporti' },
            { title: 'Assicurazione di viaggio', category: 'Documenti' },
        ]
    },
    'Abbigliamento': {
        icon: 'apparel',
        items: [
            { title: 'Magliette', category: 'Abbigliamento' },
            { title: 'Pantaloni', category: 'Abbigliamento' },
            { title: 'Giacca', category: 'Abbigliamento' },
        ]
    }
};