<template>
  <!-- Contenitore principale: mostra l'HTML generato dal markdown -->
  <section class="space-y-4">
    <article
      class="estimate-viewer prose prose-invert prose-headings:text-white/90 prose-strong:text-white max-w-none"
    >
      <!-- Inserisce l'HTML convertito e sanitizzato -->
      <div v-html="sanitizedHtml"></div>
    </article>

    <!-- Pulsante che avvia la generazione del PDF -->
    <button
      @click="exportPdf"
      :disabled="downloading"
      class="app-button text-sm"
    >
      {{ downloading ? 'Generazione PDF…' : 'Scarica PDF' }}
    </button>
  </section>
</template>

<script setup lang="ts">
// Importazioni fondamentali dal framework Vue
// ref: Crea variabili reattive
// computed: Crea valori derivati automaticamente aggiornati
import { ref, computed } from 'vue'

// Libreria che rimuove contenuti HTML non sicuri
import DOMPurify from 'dompurify'

// Libreria che converte markdown in HTML
import { marked } from 'marked'

// Props: il componente riceve una stringa markdown dal padre
const props = defineProps<{ markdown: string }>()

// Stato di caricamento per disabilitare il pulsante durante l'esportazione
const downloading = ref(false)

// Computed: converte il markdown in HTML e poi lo sanitizza
// 1. marked.parse() trasforma il testo markdown in HTML
// 2. DOMPurify.sanitize() rimuove eventuali contenuti non sicuri
const sanitizedHtml = computed(() => DOMPurify.sanitize(marked.parse(props.markdown)))

// Funzione asincrona che invia il markdown all'API per generare il PDF
async function exportPdf() {
  try {
    // Imposta lo stato "in download" per mostrare il loader
    downloading.value = true

    /*
      Invio della richiesta al server:
      - Metodo POST
      - Corpo JSON contenente il markdown originale
      - L'endpoint api/esporta-pdf deve restituire un PDF come blob
    */
    const res = await fetch('/api/esporta-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markdown: props.markdown }),
    })

    // Controllo se la risposta ha avuto successo
    if (!res.ok) throw new Error('Errore durante la generazione del PDF.')

    // Converte la risposta in un blob di tipo PDF
    const blob = await res.blob()

    /*
      Creazione di un link temporaneo per scaricare il PDF:
      1. Genera un URL locale per il blob
      2. Crea dinamicamente un elemento <a>
      3. Simula un click per avviare il download
      4. Rilascia l'URL temporaneo
    */
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'preventivo.pdf'
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    // Gestione errori lato client
    console.error(err)
    alert('Si è verificato un errore durante il download del PDF.')
  } finally {
    // Qualsiasi esito: ripristina lo stato
    downloading.value = false
  }
}
</script>

<style scoped>
/*
  Stile del contenitore che mostra l'anteprima del markdown:
  - Effetto "vetro" tramite opacità e blur
  - Scroll interno massimo
  - Ombre e bordi arrotondati
*/
.estimate-viewer {
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(2, 6, 23, 0.75);
  padding: 1.75rem;
  max-height: min(65vh, 720px);
  overflow-y: auto;
  box-shadow: 0 30px 60px rgba(3, 7, 18, 0.45);
  backdrop-filter: blur(18px);
}

/* Scrollbar personalizzata */
.estimate-viewer::-webkit-scrollbar {
  width: 6px;
}

.estimate-viewer::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #599dff, #716ffe, #a855f7);
  border-radius: 3px;
}
</style>
