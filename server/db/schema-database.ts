import { pgTable, serial, text, timestamp, numeric, uuid } from 'drizzle-orm/pg-core'

// 🗄️ Definizione della tabella "estimates" tramite Drizzle ORM
// Questo file rappresenta lo schema della tabella in PostgreSQL
export const estimates = pgTable('estimates', {
  // 🔑 Chiave primaria auto-incrementante
  id: serial('id').primaryKey(),

  // 🧍 ID univoco dell’utente (uuid generato da Supabase)
  user_id: uuid('user_id').notNull(),

  // 📧 Email dell’utente (duplicata per query più semplici e veloci)
  user_email: text('user_email').notNull(),

  // 📝 Testo originale inserito dall'utente
  description: text('description').notNull(),

  // 📄 Output generato dall’AI in formato Markdown
  markdown: text('markdown').notNull(),

  // 💶 Prezzo stimato calcolato automaticamente
  // precision: 10 → 10 cifre totali, di cui 8 intere e 2 decimali
  // scale: 2 → 2 cifre decimali
  prezzo_stimato: numeric('prezzo_stimato', {
    precision: 10,
    scale: 2
  }),

  // 🕒 Timestamp di creazione, valore predefinito = now()
  created_at: timestamp('created_at').defaultNow()
})
