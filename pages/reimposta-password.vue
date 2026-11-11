<script setup>
definePageMeta({ alias: ['/reset-password'] })

const supabase = useSupabaseClient()
const password = ref('')
const confirmPassword = ref('')
const checkingSession = ref(true)
const canReset = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const invalidLinkMessage = 'Il link di recupero non è valido o è scaduto. Richiedi un nuovo link e aprilo nello stesso browser usato per la richiesta.'

onMounted(async () => {
  try {
    const query = new URLSearchParams(window.location.search)
    const hash = new URLSearchParams(window.location.hash.slice(1))
    if (query.has('error') || query.has('error_code') || hash.has('error') || hash.has('error_code')) {
      errorMsg.value = invalidLinkMessage
      return
    }

    // Il client Nuxt Supabase completa automaticamente il callback PKCE.
    // getSession attende l'inizializzazione senza consumare il codice due volte.
    const { data, error } = await supabase.auth.getSession()
    const pendingCode = new URLSearchParams(window.location.search).has('code')
    if (error || !data.session || pendingCode) {
      errorMsg.value = invalidLinkMessage
      return
    }

    canReset.value = true
  } catch {
    errorMsg.value = 'Impossibile verificare il link. Controlla la connessione e riapri questa pagina.'
  } finally {
    checkingSession.value = false
  }
})

const resetPassword = async () => {
  if (loading.value || !canReset.value) return
  errorMsg.value = ''

  if (password.value.length < 8) {
    errorMsg.value = 'La password deve contenere almeno 8 caratteri.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'Le due password non coincidono.'
    return
  }

  loading.value = true
  try {
    const { error } = await supabase.auth.updateUser({ password: password.value })
    if (error) {
      if (error.code === 'same_password') {
        errorMsg.value = 'Scegli una password diversa da quella precedente.'
      } else if (error.code === 'weak_password') {
        errorMsg.value = 'Scegli una password più sicura: usa almeno 8 caratteri con lettere, numeri e simboli.'
      } else if (['session_not_found', 'session_expired', 'refresh_token_not_found', 'refresh_token_already_used'].includes(error.code) || error.name === 'AuthSessionMissingError') {
        canReset.value = false
        errorMsg.value = invalidLinkMessage
      } else if (error.status === 429) {
        errorMsg.value = 'Troppe richieste. Attendi qualche minuto e riprova.'
      } else {
        errorMsg.value = 'Non è stato possibile aggiornare la password. Riprova tra qualche minuto.'
      }
      return
    }

    password.value = ''
    confirmPassword.value = ''
    canReset.value = false
    successMsg.value = 'La password è stata aggiornata. Puoi tornare ai tuoi preventivi e usare la nuova password per i prossimi accessi.'
  } catch {
    errorMsg.value = 'Impossibile contattare il servizio. Controlla la connessione e riprova.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <SchedaAutenticazione
    eyebrow="Recupero password"
    title="Scegli una nuova password"
    description="Imposta una password di almeno 8 caratteri per proteggere il tuo account."
  >
    <p v-if="checkingSession" role="status" class="auth-feedback">Verifica del link in corso…</p>
    <div v-if="errorMsg" role="alert" class="auth-feedback auth-feedback--error">
      {{ errorMsg }}
    </div>
    <div v-if="successMsg" role="status" class="auth-feedback auth-feedback--success">
      {{ successMsg }}
    </div>

    <form v-if="canReset" class="auth-form" :aria-busy="loading" @submit.prevent="resetPassword">
      <label class="auth-field">
        Nuova password
        <input
          v-model="password"
          type="password"
          required
          minlength="8"
          autocomplete="new-password"
          :disabled="loading"
          class="auth-input"
          placeholder="Almeno 8 caratteri"
        />
      </label>
      <label class="auth-field">
        Conferma password
        <input
          v-model="confirmPassword"
          type="password"
          required
          minlength="8"
          autocomplete="new-password"
          :disabled="loading"
          class="auth-input"
          placeholder="Ripeti la password"
        />
      </label>
      <button type="submit" :disabled="loading" class="auth-button">
        {{ loading ? 'Salvataggio in corso…' : 'Salva nuova password' }}
      </button>
    </form>

    <div class="auth-links">
      <NuxtLink v-if="successMsg" to="/" class="auth-link">Torna ai tuoi preventivi</NuxtLink>
      <NuxtLink v-else-if="!checkingSession && !canReset" to="/recupera-password" class="auth-link">
        Richiedi un nuovo link di recupero
      </NuxtLink>
      <NuxtLink to="/accesso" class="auth-link">Torna al login</NuxtLink>
    </div>
  </SchedaAutenticazione>
</template>
