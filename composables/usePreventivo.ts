// Logica riutilizzabile per generare un preventivo.
// Gestisce caricamento, errori e risultato; invia la descrizione al server
// tramite POST /api/genera-preventivo e la funzione createEstimate.

import { ref } from 'vue'
import { useSupabaseClient } from '#imports'

export function usePreventivo() {
  // Inizializza il client Supabase per autenticazione e API
const supabase = useSupabaseClient()
  // Stato reattivo che indica se la richiesta è in corso
const loading = ref(false)
  // Conterrà il markdown generato dal server dopo la creazione del preventivo
const markdown = ref<string | null>(null)
  // Conterrà eventuali errori provenienti dalla richiesta API
const error = ref<string | null>(null)

  // Funzione principale che invia la descrizione al backend e riceve il markdown
async function createEstimate(description: string) {
    loading.value = true
    error.value = null
    try {
      const { data } = await supabase.auth.getSession()
      const token = data?.session?.access_token
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const res = await $fetch<{ ok: boolean; markdown: string; prezzo_stimato: number | null; id?: number }>('/api/genera-preventivo', {
        method: 'POST',
        headers,
        body: { description }
      })
      markdown.value = res.markdown
      return res
    } catch (e: any) {
      error.value = e?.data?.message || e?.data?.statusMessage || e.message || 'Errore'
    } finally {
      loading.value = false
    }
  }

  // Esposizione degli stati e della funzione per l'uso nei componenti Vue
return { loading, markdown, error, createEstimate }
}
