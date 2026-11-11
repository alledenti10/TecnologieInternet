<script setup>
definePageMeta({ alias: ['/register'] })

const supabase = useSupabaseClient()
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const resending = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const canResend = ref(false)

function getAuthErrorMessage(error) {
  const code = error.code || ''
  const status = error.status

  if (status === 429 || ['over_email_send_rate_limit', 'over_request_rate_limit'].includes(code)) {
    return 'Troppe richieste email. Attendi qualche minuto e riprova.'
  }
  if (['user_already_exists', 'email_exists'].includes(code)) {
    return 'Questo indirizzo email è già registrato. Se non è confermato, richiedi un nuovo invio.'
  }
  if (code === 'weak_password') {
    return 'Scegli una password più sicura, rispettando i requisiti richiesti.'
  }
  if (['email_address_invalid', 'validation_failed'].includes(code)) {
    return 'Inserisci un indirizzo email valido.'
  }
  if (code === 'signup_disabled') {
    return 'Le nuove registrazioni sono disabilitate in Supabase Auth.'
  }
  if (code === 'email_provider_disabled') {
    return 'Il provider Email è disabilitato in Supabase Auth.'
  }
  if (code === 'validation_failed' || /redirect|url|allow.list/i.test(error.message || '')) {
    return 'Il redirect email non è autorizzato. Aggiungi questo indirizzo negli URL consentiti di Supabase.'
  }
  if (/fetch|network|failed to fetch|load failed/i.test(error.message || '')) {
    return 'Supabase non è raggiungibile. Controlla URL, chiave pubblica e connessione.'
  }
  return 'Supabase ha rifiutato la registrazione. Controlla i log di Authentication e la configurazione Email.'
}

const resendConfirmation = async () => {
  if (resending.value) return
  const address = email.value.trim()
  if (!address) {
    errorMsg.value = 'Inserisci la tua email prima di richiedere un nuovo messaggio.'
    return
  }

  resending.value = true
  errorMsg.value = ''
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: address,
      options: { emailRedirectTo: `${window.location.origin}/confirm` }
    })
    if (error) {
      errorMsg.value = error.code === 'email_not_confirmed'
        ? 'Questo indirizzo non è ancora confermato. Richiedi una nuova mail di verifica.'
        : getAuthErrorMessage(error)
      canResend.value = error.code === 'email_not_confirmed'
      return
    }
    canResend.value = false
    successMsg.value = 'Mail reinviata. Controlla la posta indesiderata e attendi qualche minuto.'
  } catch {
    errorMsg.value = 'Impossibile contattare il servizio. Controlla la connessione e riprova.'
  } finally {
    resending.value = false
  }
}

const register = async () => {
  if (loading.value) return
  errorMsg.value = ''
  successMsg.value = ''
  canResend.value = false

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
    // La password viene gestita esclusivamente da Supabase Auth.
    // Il profilo in public.clients viene creato dal trigger SQL.
    const { data, error } = await supabase.auth.signUp({
      email: email.value.trim(),
      password: password.value,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`
      }
    })

    if (error) {
      console.error('Supabase signup failed', {
        code: error.code,
        status: error.status,
        message: error.message
      })
      errorMsg.value = getAuthErrorMessage(error)
      canResend.value = ['user_already_exists', 'email_exists', 'email_not_confirmed'].includes(error.code || '')
      return
    }

    password.value = ''
    confirmPassword.value = ''

    // La verifica email deve essere obbligatoria nel progetto Supabase.
    if (data.session) {
      await supabase.auth.signOut()
      errorMsg.value = 'La conferma email è disattivata nel progetto Supabase. Attiva "Confirm email" nelle impostazioni Auth e riprova.'
      return
    }

    // Supabase può restituire lo stesso esito per un indirizzo già registrato.
    successMsg.value = "Se l'indirizzo può essere registrato, riceverai un'email con il link di conferma. Controlla anche lo spam. Se hai già un account, puoi accedere."
  } catch (error) {
    console.error('Supabase signup request failed', error)
    errorMsg.value = 'Impossibile contattare Supabase. Controlla la connessione e le variabili NUXT_PUBLIC_SUPABASE_*.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <SchedaAutenticazione
    eyebrow="Registrati"
    title="Crea il tuo account"
    description="Registrati per generare e salvare i tuoi preventivi con l'intelligenza artificiale."
  >
    <div v-if="errorMsg" role="alert" class="auth-feedback auth-feedback--error">
      {{ errorMsg }}
    </div>
    <div v-if="successMsg" role="status" class="auth-feedback auth-feedback--success">
      {{ successMsg }}
    </div>

    <form v-if="!successMsg" class="auth-form" @submit.prevent="register">
      <label class="auth-field">
        Email
        <input
          v-model="email"
          type="email"
          required
          autocomplete="email"
          :disabled="loading"
          class="auth-input"
          placeholder="nome@azienda.it"
        />
      </label>

      <label class="auth-field">
        Password
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
        {{ loading ? 'Registrazione in corso…' : 'Crea account' }}
      </button>
    </form>

    <button
      v-if="successMsg || canResend"
      type="button"
      :disabled="resending"
      class="auth-button"
      @click="resendConfirmation"
    >
      {{ resending ? 'Invio in corso…' : 'Reinvia mail di conferma' }}
    </button>

    <div class="auth-links">
      <p>Hai già un account? <NuxtLink to="/accesso" class="auth-link">Accedi</NuxtLink></p>
    </div>
  </SchedaAutenticazione>
</template>
