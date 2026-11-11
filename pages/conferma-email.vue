<script setup>
definePageMeta({ alias: ['/confirm'] })

const supabase = useSupabaseClient()
const errorMsg = ref('')

onMounted(async () => {
  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.slice(1))
  if (query.has('error') || query.has('error_code') || hash.has('error') || hash.has('error_code')) {
    errorMsg.value = 'Il link di conferma non è valido o è scaduto. Se hai già confermato la tua email, accedi.'
    return
  }

  try {
    // createBrowserClient, usato dal modulo Nuxt Supabase, completa il flusso
    // PKCE automaticamente. getSession attende tale inizializzazione:
    // non bisogna scambiare il codice una seconda volta.
    const { data, error } = await supabase.auth.getSession()
    if (error || !data.session) {
      errorMsg.value = 'La conferma non è stata completata. Apri nuovamente il link nello stesso browser usato per registrarti oppure accedi se hai già confermato la tua email.'
      return
    }
    return await navigateTo('/')
  } catch {
    errorMsg.value = 'Impossibile completare la conferma. Controlla la connessione e riprova.'
  }
})
</script>

<template>
  <SchedaAutenticazione
    eyebrow="Conferma email"
    :title="errorMsg ? 'Verifica il tuo account' : 'Conferma in corso…'"
  >
    <p v-if="!errorMsg" role="status" class="auth-card__description text-center">
      Attendi un momento, stiamo completando l'accesso.
    </p>

    <div v-if="errorMsg" role="alert" class="auth-feedback auth-feedback--error">
      {{ errorMsg }}
    </div>

    <div v-if="errorMsg" class="auth-links">
      <NuxtLink to="/accesso" class="auth-link">Vai al login</NuxtLink>
      <NuxtLink to="/registrazione" class="auth-link">Torna alla registrazione</NuxtLink>
    </div>
  </SchedaAutenticazione>
</template>
