# Mappa del progetto

## Struttura dei sorgenti

```text
PreventiviAziendaliGeneratiConAi/
├── pages/                         Pagine e indirizzi del sito
│   ├── pagina-principale.vue       Modulo e generazione del preventivo
│   ├── accesso.vue                 Accesso e reinvio conferma email
│   ├── registrazione.vue           Creazione dell'account
│   ├── conferma-email.vue          Ritorno dal link di conferma
│   ├── recupera-password.vue       Richiesta del link di recupero
│   ├── reimposta-password.vue      Inserimento della nuova password
│   └── storico-preventivi.vue      Consultazione dei propri preventivi
├── components/                    Blocchi di interfaccia riutilizzabili
│   ├── SchedaAutenticazione.vue    Riquadro comune delle pagine account
│   └── VisualizzatorePreventivo.vue Anteprima Markdown e download PDF
├── composables/
│   └── usePreventivo.ts            Stato reattivo e richiesta di generazione
├── server/
│   ├── api/
│   │   ├── genera-preventivo.post.ts Controlli, AI e salvataggio
│   │   └── esporta-pdf.post.ts     Conversione Markdown in PDF
│   ├── db/
│   │   ├── connessione.ts         Pool PostgreSQL e inizializzazione Drizzle
│   │   └── schema-database.ts     Definizione della tabella preventivi
│   ├── lib/
│   │   └── intelligenza-artificiale.ts Prompt, provider e gestione errori AI
│   └── middleware/
│       └── autenticazione.ts      Lettura token e contesto utente
├── assets/css/
│   ├── stile-principale.css        Aspetto generale e pagine account
│   ├── stile-pdf.css               Sorgente dello stile di stampa
│   └── stile-pdf-compilato.css     CSS generato per il PDF
├── types/
│   └── tipi-database.ts            Tipi TypeScript del database Supabase
├── sql/
│   ├── ricrea-tabelle-progetto.sql Struttura, trigger, permessi e policy
│   └── elimina-tabelle-pubbliche.sql Manutenzione distruttiva, non per l'avvio
├── public/
│   └── icona-sito.svg              Icona nella scheda del browser
├── documentazione/
│   └── MAPPA_PROGETTO.md           Questo documento
├── .env                           Credenziali e configurazione locale
├── .env.example                    Traccia di configurazione
├── nuxt.config.ts                 Configurazione Nuxt e Supabase
├── tailwind.config.ts             Colori, font e utilità CSS
├── package.json                   Dipendenze e comandi npm
├── package-lock.json              Versioni esatte delle dipendenze
└── LEGGIMI.md                      Istruzioni operative
```

`node_modules`, `.nuxt` e `.output` contengono dipendenze o file generati:
non sono sorgenti da rinominare o modificare a mano.

Le cartelle riconosciute dal framework (`pages`, `components`, `composables`,
`server/api`, `server/middleware`, `public`) mantengono il nome convenzionale.
Anche gli altri percorsi organizzativi seguono la struttura abituale Nuxt.
I suffissi `.vue`, `.ts`, `.css`, `.sql` e `.post.ts` descrivono il formato
oppure il metodo HTTP: non vanno tradotti.
`usePreventivo` conserva il prefisso `use`, convenzione dei composable Vue.

## Corrispondenza tra nomi precedenti e nomi italiani

| Prima | Adesso |
| --- | --- |
| `pages/index.vue` | `pages/pagina-principale.vue` |
| `pages/login.vue` | `pages/accesso.vue` |
| `pages/register.vue` | `pages/registrazione.vue` |
| `pages/confirm.vue` | `pages/conferma-email.vue` |
| `pages/forgot-password.vue` | `pages/recupera-password.vue` |
| `pages/reset-password.vue` | `pages/reimposta-password.vue` |
| `pages/preventivi.vue` | `pages/storico-preventivi.vue` |
| `components/AuthCard.vue` | `components/SchedaAutenticazione.vue` |
| `components/EstimateViewer.vue` | `components/VisualizzatorePreventivo.vue` |
| `composables/useEstimate.ts` | `composables/usePreventivo.ts` |
| `server/api/estimate.post.ts` | `server/api/genera-preventivo.post.ts` |
| `server/api/export-pdf.post.ts` | `server/api/esporta-pdf.post.ts` |
| `server/lib/ai.ts` | `server/lib/intelligenza-artificiale.ts` |
| `server/db/index.ts` | `server/db/connessione.ts` |
| `server/db/schema.ts` | `server/db/schema-database.ts` |
| `server/middleware/auth.ts` | `server/middleware/autenticazione.ts` |
| `types/database.types.ts` | `types/tipi-database.ts` |
| `assets/css/tailwind.css` | `assets/css/stile-principale.css` |
| `assets/css/pdf.tailwind.css` | `assets/css/stile-pdf.css` |
| `assets/css/pdf.built.css` | `assets/css/stile-pdf-compilato.css` |
| `public/favicon.svg` | `public/icona-sito.svg` |
| `sql/recreate_project_tables.sql` | `sql/ricrea-tabelle-progetto.sql` |
| `sql/drop_all_public_tables.sql` | `sql/elimina-tabelle-pubbliche.sql` |
| `.env.example` | `.env.example` |
| `README.md` (in entrambe le cartelle) | `LEGGIMI.md` |

## Percorso consigliato per presentare il codice

1. `pages/pagina-principale.vue`: mostra cosa vede e cosa inserisce l'utente.
2. `composables/usePreventivo.ts`: mostra il collegamento tra interfaccia e server.
3. `server/api/genera-preventivo.post.ts`: mostra autenticazione e salvataggio.
4. `server/lib/intelligenza-artificiale.ts`: spiega prompt e servizio AI.
5. `server/db/schema-database.ts` e SQL: spiega dati e appartenenza all'utente.
6. `pages/storico-preventivi.vue`: mostra il recupero dei documenti salvati.
7. `components/VisualizzatorePreventivo.vue` e API PDF: spiega l'esportazione.
8. Pagine account e `SchedaAutenticazione.vue`: spiega login, conferma e recupero.
9. `nuxt.config.ts` e CSS: spiega configurazione, routing e stile comune.

Le istruzioni operative complete si trovano in `LEGGIMI.md`.
