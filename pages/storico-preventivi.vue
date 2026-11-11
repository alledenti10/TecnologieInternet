<template>
  <section class="preventivi-page app-page-background">
    <!-- Effetto grafico di sfondo -->
    <div class="preventivi-page__fx" aria-hidden="true"></div>

    <!-- Contenitore principale della pagina -->
    <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-12 text-white lg:px-6 lg:py-16">

      <!-- Header della pagina -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">Archivio</p>
          <h2 class="text-3xl font-semibold">I miei preventivi</h2>
          <p class="text-sm text-white/70">Rivedi, scarica e riutilizza le proposte generate con l'AI.</p>
        </div>

        <!-- Pulsante per tornare alla home -->
        <button
          type="button"
          class="app-button gap-2 text-sm"
          @click="navigateTo('/')"
        >
          ← Torna alla home
        </button>
      </div>

      <!-- Contenitore centrale dei preventivi -->
      <div class="rounded-[32px] border border-white/15 bg-slate-700/60 p-6 shadow-glow backdrop-blur-xl">

        <!-- Stato "Caricamento" -->
        <div v-if="loading" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center text-white/70">
          Caricamento preventivi…
        </div>

        <!-- Stato "Nessun preventivo trovato" -->
        <div v-else-if="!preventivi || preventivi.length === 0" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center text-white/70">
          Nessun preventivo disponibile. Generane uno dalla home per iniziare.
        </div>

        <!-- Lista preventivi -->
        <div v-else class="grid gap-6">
          <article
            v-for="p in preventivi"
            :key="p.id"
            class="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur"
          >
            <!-- Header del singolo preventivo -->
            <div class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <p class="text-xs uppercase tracking-[0.4em] text-white/60">Preventivo</p>
                <h3 class="text-xl font-semibold">#{{ p.id }}</h3>
              </div>

              <!-- Data del preventivo -->
              <span class="rounded-full border border-white/10 px-3 py-1 text-sm text-white/70">
                {{ new Date(p.created_at).toLocaleDateString() }}
              </span>
            </div>

            <!-- Visualizzatore markdown con il contenuto del preventivo -->
            <VisualizzatorePreventivo :markdown="p.markdown" />
          </article>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({ alias: ['/preventivi'] })

// Componente dedicato a visualizzare il markdown del preventivo
import VisualizzatorePreventivo from '~/components/VisualizzatorePreventivo.vue'

// Client Supabase per eseguire query verso il database
const supabase = useSupabaseClient()

// Informazioni sull'utente autenticato
const user = useSupabaseUser()

// Lista dei preventivi dell'utente
const preventivi = ref([])

// Stato di caricamento iniziale
const loading = ref(true)

onMounted(async () => {
  loading.value = true

  // Se l’utente non è loggato, reindirizzalo alla login
  if (!user.value) {
    return navigateTo("/accesso")
  }

  // Supabase 2 espone i claims JWT: sub è l'UUID dell'utente.
  // Il filtro per UUID coincide con la policy RLS, anche se l'email cambia.
  const { data, error } = await supabase
    .from("estimates")
    .select("*")
    .eq("user_id", user.value.sub)
    .order("created_at", { ascending: false }) // ordina dal più recente al più vecchio

  // Stampa errori eventuali (utile per debugging)
  if (error) console.error(error)

  // Salva i preventivi, oppure array vuoto se non ce ne sono
  preventivi.value = data || []

  // Fine caricamento
  loading.value = false
})
</script>


<style scoped>
.preventivi-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.preventivi-page__fx {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
  background-size: 120px 120px;
  mask-image: radial-gradient(circle at center, rgba(0, 0, 0, 0.8), transparent 80%);
}
</style>
