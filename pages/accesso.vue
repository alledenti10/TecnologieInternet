<script setup>
definePageMeta({ alias: ['/login'] })

const supabase = useSupabaseClient()
const loading = ref(false)
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const confirmationMode = ref(false)
const emailInput = ref(null)

const setConfirmationMode = async (enabled) => {
  if (loading.value) return
  confirmationMode.value = enabled
  errorMsg.value = ''
  successMsg.value = ''
  password.value = ''
  await nextTick()
  emailInput.value?.focus()
}

const login = async () => {
  if (loading.value) return
  loading.value = true
  errorMsg.value = ''

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value
    })

    if (error) {
      errorMsg.value = error.code === 'email_not_confirmed'
        ? 'Conferma prima il tuo indirizzo email tramite il link ricevuto.'
        : 'Email o password non corretti.'
      return
    }

    return await navigateTo('/')
  } catch {
    errorMsg.value = 'Impossibile accedere. Controlla la connessione e riprova.'
  } finally {
    loading.value = false
  }
}

const resendConfirmation = async () => {
  if (loading.value) return
  loading.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.value.trim(),
      options: { emailRedirectTo: `${window.location.origin}/confirm` }
    })

    if (error) {
      errorMsg.value = error.status === 429 || ['over_email_send_rate_limit', 'over_request_rate_limit'].includes(error.code)
        ? 'Troppe richieste. Attendi qualche minuto prima di riprovare.'
        : 'Impossibile inviare il link di conferma. Riprova tra qualche minuto.'
      return
    }

    successMsg.value = "Se l'indirizzo è in attesa di conferma, riceverai un nuovo link via email. Controlla anche la posta indesiderata."
  } catch {
    errorMsg.value = 'Impossibile contattare il servizio. Controlla la connessione e riprova.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <SchedaAutenticazione
    :eyebrow="confirmationMode ? 'Conferma email' : 'Accedi'"
    :title="confirmationMode ? 'Conferma il tuo account' : 'Bentornato'"
    :description="confirmationMode
      ? 'Inserisci la tua email per ricevere un nuovo link di conferma.'
      : 'Collegati per salvare i preventivi generati con l’intelligenza artificiale.'"
  >
    <p v-if="errorMsg" role="alert" class="auth-feedback auth-feedback--error">{{ errorMsg }}</p>
    <p v-if="successMsg" role="status" class="auth-feedback auth-feedback--success">{{ successMsg }}</p>

    <form v-if="!successMsg" class="auth-form" :aria-busy="loading" @submit.prevent="confirmationMode ? resendConfirmation() : login()">
      <label class="auth-field" for="login-email">
        Email
        <input
          id="login-email"
          ref="emailInput"
          v-model="email"
          name="email"
          type="email"
          required
          autocomplete="email"
          :disabled="loading"
          class="auth-input"
          placeholder="nome@azienda.it"
        />
      </label>

      <label v-if="!confirmationMode" class="auth-field" for="login-password">
        Password
        <input
          id="login-password"
          v-model="password"
          name="password"
          type="password"
          required
          autocomplete="current-password"
          :disabled="loading"
          class="auth-input"
        />
      </label>

      <button type="submit" :disabled="loading" class="auth-button">
        {{ confirmationMode
          ? (loading ? 'Invio in corso…' : 'Invia link di conferma')
          : (loading ? 'Accesso in corso…' : 'Accedi') }}
      </button>
    </form>

    <nav v-if="!confirmationMode" class="auth-links" aria-label="Assistenza accesso">
      <NuxtLink to="/recupera-password" class="auth-link">Password dimenticata?</NuxtLink>
      <p>Non hai un account? <NuxtLink to="/registrazione" class="auth-link">Registrati</NuxtLink></p>
      <button type="button" class="auth-link" :disabled="loading" @click="setConfirmationMode(true)">
        Invia un nuovo link di conferma
      </button>
    </nav>
    <div v-else class="auth-links">
      <button type="button" class="auth-link" :disabled="loading" @click="setConfirmationMode(false)">
        Torna all'accesso
      </button>
    </div>
  </SchedaAutenticazione>
</template>
