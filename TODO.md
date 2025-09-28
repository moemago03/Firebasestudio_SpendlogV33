# Roadmap del Progetto

Questo file traccia le attività di sviluppo, i bug fix e i miglioramenti per l'applicazione.

## Priorità Alta

- [x] ~~Risolvere il flusso di autenticazione con Google.~~ (Completato)
- [ ] **Sicurezza:** Mettere in sicurezza le API key (es. Gemini AI) utilizzando variabili d'ambiente e `capacitor-secure-storage` invece di lasciarle hardcoded nel codice sorgente.

## Priorità Media

- [x] ~~Sostituire i tassi di cambio simulati con un'API reale.~~ (Completato)
- [ ] **Funzionalità Valuta:** Permettere agli utenti di selezionare e impostare una valuta di base predefinita diversa dall'Euro (EUR).
- [ ] **UI/UX:** Aggiungere indicatori di caricamento (spinner, skeleton screens) durante il recupero dei dati (es. itinerari, spese, tassi di cambio) per migliorare la percezione di reattività dell'app.
- [ ] **Funzionalità Spese:** Implementare la categorizzazione delle spese (es. Cibo, Trasporti, Alloggio) con icone personalizzate.

## Priorità Bassa

- [ ] **Test:** Scrivere test unitari e di integrazione per le funzionalità critiche (es. autenticazione, calcoli di valuta) per garantire la stabilità a lungo termine.
- [ ] **Documentazione Tecnica:** Espandere la documentazione interna del codice per descrivere l'architettura dei dati e il flusso dei componenti principali.
