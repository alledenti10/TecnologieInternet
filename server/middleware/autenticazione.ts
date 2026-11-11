// server/middleware/autenticazione.ts
import { defineEventHandler, getCookie } from 'h3'
import { createClient } from '@supabase/supabase-js'

// 🔐 Middleware di autenticazione lato server (Nitro)
// Viene eseguito automaticamente per ogni richiesta

export default defineEventHandler(async (event) => {
  // 🏗️ Crea un client Supabase *server-side*
  // Usiamo ANON KEY ma non vengono persistite sessioni (sicuro lato server)
  const supabase = createClient(
    process.env.NUXT_PUBLIC_SUPABASE_URL!,      // URL del progetto Supabase
    process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY!, // Anon key pubblica
    { auth: { persistSession: false } }         // ❗ Evita sessioni persistenti lato server
  )

  // 🍪 Recupera il token di accesso dalla cookie "sb-access-token"
  // Questa cookie viene gestita da Supabase lato client
  const token = getCookie(event, 'sb-access-token')

  // Se non c’è token → l'utente è trattato come non loggato
  if (!token) return

  // 🔍 Verifica il token e ottiene i dati utente
  // Metodo sicuro lato server: Supabase controlla firma JWT
  const { data } = await supabase.auth.getUser(token)

  // Se esiste un utente valido → attacca l'utente al contesto della request
  // Questo permette ai server endpoints di usarlo con: event.context.user
  if (data?.user) {
    event.context.user = data.user
  }
})

