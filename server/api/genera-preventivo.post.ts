import {
  defineEventHandler,
  readBody,
  sendError,
  getCookie,
  setCookie,
  deleteCookie,
  createError,
  isError
} from 'h3'
import { createServerClient } from '@supabase/ssr'
import { initDb } from '../db/connessione'
import { estimates } from '../db/schema-database'
import { generateEstimateMarkdown } from '../lib/intelligenza-artificiale'

/**
 * Estrae il prezzo stimato dal markdown generato dall'AI.
 * Ritorna l'ultimo valore numerico formattato come "€ 12.345,67".
 * Gestisce correttamente formati EU e US.
 */
function extractPrezzoStimato(markdown: string): number | null {
  const matches = [...markdown.matchAll(/€\s?([\d.,]+)/g)]
  if (matches.length === 0) return null

  // Prende l'ultimo importo trovato, più probabile sia quello finale del preventivo
  let numStr = matches[matches.length - 1][1].trim()

  /**
   * Correzione smart dei formati:
   * - € 12.500,00  (EU)
   * - € 12,500.00  (US)
   * - € 12500.00   (flat)
   * - € 12.500     (thousands)
   */
  if (numStr.includes('.') && numStr.includes(',')) {
    // Caso misto — determinazione eur vs us in base alla posizione dell'ultimo simbolo
    if (numStr.lastIndexOf(',') > numStr.lastIndexOf('.')) {
      numStr = numStr.replace(/\./g, '').replace(',', '.')
    } else {
      numStr = numStr.replace(/,/g, '')
    }
  } else if (numStr.includes('.')) {
    // Valuta se il punto è separatore migliaia
    if (numStr.split('.')[1]?.length === 3) {
      numStr = numStr.replace(/\./g, '')
    }
  } else if (numStr.includes(',')) {
    // Valuta se la virgola è separatore migliaia o decimale
    if (numStr.split(',')[1]?.length === 3) {
      numStr = numStr.replace(/,/g, '')
    } else {
      numStr = numStr.replace(',', '.')
    }
  }

  const val = parseFloat(numStr)
  return isNaN(val) ? null : val
}

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)

    /**
     * 🔐 Creazione del client Supabase lato server.
     * Usa cookie HTTP-only tramite il sistema di Nuxt/H3.
     */
    const supabase = createServerClient(
      config.public.supabaseUrl,
      config.public.supabaseKey,
      {
        cookies: {
          get: (name) => getCookie(event, name),
          set: (name, value, opts) => setCookie(event, name, value, opts),
          remove: (name, opts) => deleteCookie(event, name, opts)
        }
      }
    )

    /**
     * 🔐 Autenticazione obbligatoria.
     * Se l'utente non è autenticato, restituiamo 401 immediatamente.
     */
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) {
      return sendError(event, createError({
        statusCode: 401,
        statusMessage: 'Utente non autenticato'
      }))
    }

    /**
     * 📩 Lettura del body contenente la descrizione del progetto.
     */
    const body = await readBody(event)
    const description = typeof body?.description === 'string' ? body.description.trim() : ''

    // Validazione base input
    if (description.length < 5 || description.length > 10000) {
      return sendError(event, createError({
        statusCode: 400,
        statusMessage: 'La descrizione deve contenere da 5 a 10000 caratteri.'
      }))
    }

    // Endpoint e modello configurabili; di default usa OpenRouter gratuito.
    const markdown = await generateEstimateMarkdown(description, config)

    // Estrae eventuale prezzo totale
    const prezzo_stimato = extractPrezzoStimato(markdown)

    /**
     * 🗄️ Connessione al DB tramite Drizzle e insert del preventivo.
     */
    const db = await initDb()

    const insertRes = await db.insert(estimates).values({
      user_id: user.id,
      user_email: user.email || '',
      description,
      markdown,
      prezzo_stimato: prezzo_stimato === null ? null : prezzo_stimato.toFixed(2),
      created_at: new Date()
    }).returning()

    /**
     * Risposta finale verso il frontend.
     */
    return {
      ok: true,
      markdown,
      prezzo_stimato,
      id: insertRes[0]?.id
    }

  } catch (err: any) {
    if (isError(err)) return sendError(event, err)
    console.error('estimate error', { name: err?.name, code: err?.code })
    return sendError(event, createError({
      statusCode: 500,
      statusMessage: 'Impossibile salvare il preventivo. Controlla la configurazione del database e riprova.'
    }))
  }
})
