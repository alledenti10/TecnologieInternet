import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'

// Variabile globale che contiene l'istanza del DB
// Viene inizializzata solo una volta (singleton)
let db: ReturnType<typeof drizzle> | null = null

export async function initDb() {
  // 🧠 Evita di creare più connessioni: se il DB è già pronto, restituiscilo
  if (db) return db

  // URL completa del database (es: da Supabase)
  const connectionString = process.env.DATABASE_URL!

  try {
    // 🌐 Crea il connection pool PostgreSQL
    // Pool = gestione efficiente di connessioni concorrenti
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false } // 🔐 Obbligatorio con Supabase (SSL self-signed)
    })

    // 🏗️ Crea la tabella "estimates" se non esiste
    // Drizzle può creare migration ma qui si usa SQL semplice per sicurezza
    await pool.query(`
      CREATE TABLE IF NOT EXISTS estimates (
        id serial PRIMARY KEY,
        user_id uuid NOT NULL,
        user_email text NOT NULL,
        description text NOT NULL,
        markdown text NOT NULL,
        prezzo_stimato numeric(10,2),
        created_at timestamptz DEFAULT now()
      )
    `)

    // 🔗 Inizializza Drizzle ORM usando il pool
    db = drizzle(pool)

    return db
  } catch (err: any) {
    // 🔥 Log errore leggibile
    console.error('Database connection error:', err.message || err)

    // ❗ Errore frequente: hostname del DB errato o DNS non risolto
    if (err.code === 'ENOTFOUND' || /ENOTFOUND/i.test(String(err.message))) {
      throw new Error(
        `Database host not found. Check your DATABASE_URL and network/DNS settings. (${err.message})`
      )
    }

    // Rilancia altri errori
    throw err
  }
}
