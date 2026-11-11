<template>
  <!-- Pagina principale della home dei preventivi -->
  <section class="index-page app-page-background">
    <!-- Griglia decorativa dello sfondo (solo estetica) -->
    <div class="index-page__grid" aria-hidden="true"></div>
    <!-- Effetto "glow" azzurrato sullo sfondo -->
    <div class="index-page__glow" aria-hidden="true"></div>

    <!-- Contenitore principale che organizza layout in colonna su mobile e in riga su desktop -->
    <div
      class="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-12 text-white lg:flex-row lg:items-start lg:px-6 lg:py-16"
    >
      <!-- Sezione sinistra: header, login, informazioni -->
      <header class="flex flex-1 flex-col gap-8">
        <div class="space-y-6">
          <!-- Badge superiore decorativo -->
          <span class="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold tracking-[0.35em] text-aurora-100">
            Preventivi generati con AI
          </span>

          <!-- Titolo principale + descrizione -->
          <div class="space-y-4">
            <h1 class="text-4xl font-semibold leading-tight md:text-5xl xl:text-6xl">
              Preventivi aziendali
            </h1>
            <p class="text-base text-white/70 md:text-lg">
              Inserisci una descrizione del progetto e genera un documento professionale.
            </p>
          </div>
        </div>

        <!-- Box di login / logout + pulsanti correlati -->
        <div class="flex flex-col gap-4 rounded-3xl border border-white/15 bg-slate-700/50 p-6 backdrop-blur-xl">
          <div class="flex flex-wrap items-center gap-3">
            <!-- Se l’utente NON è loggato, mostra il pulsante per accedere -->
            <button
              v-if="!user"
              type="button"
              @click="gotoLogin"
              class="app-button text-sm"
            >
              Accedi per salvare i preventivi
            </button>

            <!-- Se l’utente è loggato, mostra pulsante di logout -->
            <button
              v-else
              type="button"
              @click="logout"
              class="app-button text-sm"
            >
              Logout
            </button>

            <!-- Pulsante per lo storico preventivi (solo se loggato) -->
            <button
              type="button"
              :disabled="!user"
              class="app-button text-sm"
              @click="gotoPreventivi"
            >
              Storico preventivi
            </button>
          </div>

          <!-- Mostra email utente loggato -->
          <p v-if="user" class="text-xs font-semibold tracking-[0.3em] text-white/60">
            👤{{ user.email }}
          </p>

          <!-- Testo informativo se non loggato -->
          <p v-else class="text-sm text-white/60">
            Collega il tuo account per salvare i preventivi.
          </p>
        </div>

        <!-- Tre piccole card descrittive delle funzionalità -->
        <div class="grid gap-4 text-sm text-white/70 sm:grid-cols-3">
          <div class="rounded-2xl border border-white/15 bg-slate-700/40 p-4">
            <p class="text-2xl font-semibold text-white">Velocissimo</p>
            <p>Generazione veloce</p>
          </div>
          <div class="rounded-2xl border border-white/15 bg-slate-700/40 p-4">
            <p class="text-2xl font-semibold text-white">Markdown</p>
            <p>Formato professionale</p>
          </div>
          <div class="rounded-2xl border border-white/15 bg-slate-700/40 p-4">
            <p class="text-2xl font-semibold text-white">PDF</p>
            <p>Scarica in un click in fondo al preventivo</p>
          </div>
        </div>
      </header>

      <!-- Sezione destra: form + anteprima preventivo -->
      <div class="flex w-full flex-1 flex-col gap-6 rounded-[32px] border border-white/15 bg-slate-700/60 p-6 shadow-glow backdrop-blur-xl md:p-8">
        <!-- Form che invia la richiesta per generare il preventivo -->
        <form class="space-y-5" @submit.prevent="gen">
          <label class="space-y-4 text-sm font-semibold tracking-wide text-white/80">
            Descrizione del progetto
            <p></p> 
            <!-- Textarea collegata allo stato reattivo `description` -->
            <textarea
              v-model="description"
              rows="12"
              class="w-full rounded-2xl border border-white/15 bg-white/5 px-6 py-7 text-base text-white placeholder:text-white/40 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-400/20"
              placeholder="Descrivi il contesto, obiettivi, tempistiche, budget..."
            ></textarea>
          </label>

          <!-- Pulsanti: genera preventivo + reset form -->
          <div class="flex flex-wrap gap-3">
            <!-- Generazione preventivo AI -->
            <button
              type="submit"
              :disabled="loading || !description.trim()"
              class="app-button flex-1 px-6 py-4 text-base"
            >
              {{ loading ? 'Generazione in corso…' : 'Genera preventivo' }}
            </button>

            <!-- Pulsante per pulire l’intera pagina -->
            <button
              type="button"
              class="app-button px-6 py-4 text-base"
              @click="resetPage"
            >
              Pulisci
            </button>
          </div>
        </form>

        <!-- Messaggio durante caricamento -->
        <p v-if="loading" class="text-sm text-white/60">
          Il tuo preventivo è quasi pronto…
        </p>

        <!-- Messaggio errore -->
        <p v-if="error" class="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {{ error }}
        </p>

        <!-- Mostra l’anteprima markdown solo quando disponibile -->
        <div v-if="markdown" class="rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur">
          <!-- Componente dedicato che converte markdown in HTML e permette il download PDF -->
          <VisualizzatorePreventivo :markdown="markdown" />
        </div>
      </div>
    </div>
  </section>
</template>


<script setup lang="ts">
definePageMeta({ path: '/', alias: ['/pagina-principale'] })

/*
  Import dei servizi Supabase:
  - useSupabaseClient: per chiamare metodi di autenticazione
  - useSupabaseUser: contiene l’utente attualmente loggato
*/
import { useSupabaseClient, useSupabaseUser } from '#imports'

// Import base Vue
import { ref } from 'vue'

// Import logica per generare preventivi tramite AI (composable)
import { usePreventivo } from '~/composables/usePreventivo'

// Import componente che mostra markdown + PDF export
import VisualizzatorePreventivo from '~/components/VisualizzatorePreventivo.vue'

// Inizializzazione Supabase
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// Navigazione verso pagina login
const gotoLogin = () => navigateTo('/accesso')

// Navigazione verso pagina storico preventivi
const gotoPreventivi = () => navigateTo('/storico-preventivi')

// Logout utente attuale
const logout = async () => {
  await supabase.auth.signOut({ scope: 'local' })
  return navigateTo('/')
}

// Stato della textarea dove l’utente descrive il progetto
const description = ref('')

// Estraggo dal composable:
// - loading: operazione in corso
// - markdown: risultato generato
// - error: eventuali errori
// - createEstimate: funzione che chiama API AI
const { loading, markdown, error, createEstimate } = usePreventivo()

// Funzione chiamata dal submit del form
async function gen() {
  await createEstimate(description.value)
}

// Reset completo della pagina (input + risultati)
function resetPage() {
  description.value = ''
  markdown.value = ''
  error.value = ''
  loading.value = false
}
</script>


<style scoped>
.index-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.index-page__grid,
.index-page__glow {
  position: absolute;
  inset: 0;
}

.index-page__grid {
  background-image: linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(circle at center, rgba(0, 0, 0, 0.5), transparent 70%);
}

.index-page__glow {
  background: radial-gradient(circle at 70% 20%, rgba(59, 130, 246, 0.2), transparent 50%);
  filter: blur(40px);
}

textarea::-webkit-scrollbar {
  width: 6px;
}

textarea::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #599dff, #716ffe, #a855f7);
  border-radius: 3px;
}
</style>
