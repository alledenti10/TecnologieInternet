<script setup>
definePageMeta({ alias: ['/forgot-password'] })

const supabase = useSupabaseClient()
const email = ref('')
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const sendRecoveryEmail = async () => {
  if (loading.value) return
  errorMsg.value = ''
  successMsg.value = ''

  const address = email.value.trim()
  if (!address) {
    errorMsg.value = 'Inserisci il tuo indirizzo email.'
    return
  }

  loading.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(address, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      if (error.status === 429 || ['over_email_send_rate_limit', 'over_request_rate_limit'].includes(error.code)) {
        errorMsg.value = 'Troppe richieste. Attendi qualche minuto prima di riprovare.'
      } else if (['email_address_invalid', 'validation_failed'].includes(error.code)) {
        errorMsg.value = 'Inserisci un indirizzo email valido.'
      } else {
        errorMsg.value = 'Non è stato possibile inviare il link di recupero. Riprova tra qualche minuto.'
      }
      return
    }

    successMsg.value = "Se l'indirizzo è associato a un account, riceverai un'email con il link per scegliere una nuova password. Controlla anche lo spam e apri il link nello stesso browser usato per questa richiesta."
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
    title="Password dimenticata?"
    description="Inserisci la tua email: ti invieremo un link per scegliere una nuova password."
  >
    <div v-if="errorMsg" role="alert" class="auth-feedback auth-feedback--error">
      {{ errorMsg }}
    </div>
    <div v-if="successMsg" role="status" class="auth-feedback auth-feedback--success">
      {{ successMsg }}
    </div>

    <form v-if="!successMsg" class="auth-form" :aria-busy="loading" @submit.prevent="sendRecoveryEmail">
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
      <button type="submit" :disabled="loading" class="auth-button">
        {{ loading ? 'Invio in corso…' : 'Invia link di recupero' }}
      </button>
    </form>

    <div class="auth-links">
      <button v-if="successMsg" type="button" class="auth-link" @click="successMsg = ''">
        Usa un altro indirizzo email
      </button>
      <NuxtLink to="/accesso" class="auth-link">Torna al login</NuxtLink>
    </div>

    <template #footer>
      <NuxtLink to="/" class="auth-link">← Torna alla home</NuxtLink>
    </template>
  </SchedaAutenticazione>
</template>
