# Preventivi aziendali generati con AI

Applicazione Nuxt/Vue per creare preventivi a partire da una descrizione,
salvarli in PostgreSQL e scaricarli in PDF. Supabase gestisce gli account;
OpenRouter fornisce l'accesso al modello AI configurato.

## Come orientarsi

Leggi la [mappa del progetto](documentazione/MAPPA_PROGETTO.md).
La spiegazione completa del funzionamento, della configurazione e degli imprevisti
risolti è in [Funzionamento_progetto.txt](Funzionamento_progetto.txt).

| Pagina | File | Indirizzo |
| --- | --- | --- |
| Generazione preventivo | `pages/pagina-principale.vue` | `/` |
| Accesso e reinvio conferma | `pages/accesso.vue` | `/accesso` |
| Creazione account | `pages/registrazione.vue` | `/registrazione` |
| Conferma dell'email | `pages/conferma-email.vue` | `/conferma-email` |
| Richiesta recupero | `pages/recupera-password.vue` | `/recupera-password` |
| Scelta nuova password | `pages/reimposta-password.vue` | `/reimposta-password` |
| Archivio personale | `pages/storico-preventivi.vue` | `/storico-preventivi` |

I vecchi percorsi `/login`, `/register`, `/confirm`, `/forgot-password`,
`/reset-password` e `/preventivi` sono alias delle rispettive pagine italiane.
Anche `/pagina-principale` rimanda alla pagina principale.

## Avvio in sviluppo

Il progetto dichiara Node.js 22.12 o successivo. Dalla cartella con `package.json`:

```powershell
npm ci
npm run dev
```

`npm ci` installa le versioni del lockfile. Se le dipendenze sono già installate,
non serve ripeterlo per avviare l'applicazione.
`predev` compila automaticamente lo stile PDF prima dell'avvio.
Apri `http://localhost:3000/accesso`.

Mantieni il `.env` esistente. Solo per una nuova installazione puoi creare
il file dalla traccia `.env.example`, senza sovrascrivere un `.env` già configurato.
Non condividere le credenziali.

## Configurazione Supabase

Per un database nuovo, lo script `sql/ricrea-tabelle-progetto.sql` definisce
profili, preventivi, trigger e policy. Contiene istruzioni CREATE TABLE:
non va rilanciato su tabelle già presenti. La sola rinomina dei file non
richiede operazioni sul database.

`sql/elimina-tabelle-pubbliche.sql` è uno strumento distruttivo di manutenzione:
elimina tutte le tabelle dello schema public e non serve per avviare il progetto.

In Authentication > Providers > Email abilita **Confirm email**.
In Authentication > URL Configuration configura l'indirizzo del sito e autorizza:

- `http://localhost:3000/confirm`
- `http://localhost:3000/reset-password`

Usa la porta e il dominio effettivi se diversi. Il codice conserva questi due
indirizzi nelle email per compatibilità con la configurazione precedente;
gli alias aprono `conferma-email.vue` e `reimposta-password.vue`.
I template email devono conservare il link `{{ .ConfirmationURL }}`.
L'invio dipende dalla configurazione Email/SMTP di Supabase.
Apri il link nello stesso browser da cui hai fatto la richiesta: il client
usa PKCE e completa automaticamente lo scambio del codice.

## AI e configurazione privata

Variabili lette dalla configurazione del progetto:

- `AI_API_KEY`: chiave del servizio AI, solo server.
- `AI_BASE_URL`: predefinito `https://openrouter.ai/api/v1`.
- `AI_MODEL`: predefinito `openrouter/free`.
- `AI_MAX_OUTPUT_TOKENS`: predefinito 2000; intervallo accettato 256–8192.
- `DATABASE_URL`: connessione PostgreSQL privata.
- `NUXT_PUBLIC_SUPABASE_URL` e `NUXT_PUBLIC_SUPABASE_ANON_KEY`: configurazione pubblica Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: presente nella configurazione privata; gli endpoint
  attuali non la usano per scrivere i preventivi, che passano tramite Drizzle.

Non inserire chiavi private tra le variabili `NUXT_PUBLIC_*`.
La disponibilità del modello e le quote dipendono dal provider e dall'account.
Il progetto non addestra un modello e non introduce un listino prezzi:
le cifre del preventivo sono stime da confermare.

## Comandi disponibili

- `npm run dev`: sviluppo, con compilazione iniziale CSS PDF.
- `npm run build:pdf:css`: genera `assets/css/stile-pdf-compilato.css`.
- `npm run dev:watch:pdf`: ricompila lo stile PDF quando cambia.
- `npm run dev:all`: compila lo stile PDF e avvia Nuxt.
- `npm run build`: prepara la versione di produzione; `prebuild` compila il CSS PDF.
- `npm run start`: avvia la build di produzione già generata.

Il PDF usa Puppeteer e Chromium. In locale Puppeteer avvia il browser
installato tramite npm e usa lo stile PDF compilato.

## API interne

- `POST /api/genera-preventivo`: verifica l'utente, usa il modello AI e salva
  il preventivo nel database.
- `POST /api/esporta-pdf`: converte il Markdown in un PDF scaricabile.
