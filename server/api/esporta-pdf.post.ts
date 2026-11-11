import { defineEventHandler, readBody, setHeader, createError } from 'h3'
import puppeteer from 'puppeteer'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'
import { join, dirname } from 'path'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'

export default defineEventHandler(async (event) => {

  // 📥 Legge il body dell’API
  const { markdown } = await readBody(event)

  // ❌ Validazione semplice
  if (!markdown) {
    throw createError({ statusCode: 400, statusMessage: 'Markdown mancante' })
  }

  // 🔐 Sanitize HTML generato da markdown (contro XSS)
  const htmlContent = DOMPurify.sanitize(marked.parse(markdown))

  // 📄 Percorsi possibili al file CSS già compilato (Tailwind PDF build)
  // Nitro/Node hanno strutture imprevedibili → servono fallback multipli
  const moduleDir = dirname(fileURLToPath(import.meta.url))
  const cssCandidates = [
    join(process.cwd(), 'assets', 'css', 'stile-pdf-compilato.css'),
    join(moduleDir, '..', '..', '..', 'assets', 'css', 'stile-pdf-compilato.css'),
    join(moduleDir, '..', '..', 'assets', 'css', 'stile-pdf-compilato.css'),
    join(moduleDir, '..', 'assets', 'css', 'stile-pdf-compilato.css')
  ]

  let css = ''
  try {
    // 🔍 Scorre i percorsi finché trova il file CSS
    for (const p of cssCandidates) {
      try {
        css = readFileSync(p, 'utf-8')
        if (css) break
      } catch {}
    }
    if (!css) throw new Error('No CSS found')
  } catch (error) {
    // ⚠️ Se Tailwind PDF CSS non esiste → usa stile minimo
    console.warn('⚠️ Impossibile leggere CSS PDF compilato; uso fallback minimo.')
    css = `
      @page{margin:2cm}
      body{font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;font-size:13px;color:#1f2937}
      h1,h2,h3{color:#0f172a}
      table{border-collapse:collapse;width:100%;margin:1rem 0}
      th,td{border:1px solid #e5e7eb;padding:6px 10px}
    `
  }

  // 🧠 Avvia Puppeteer (Chrome headless)
  // --no-sandbox evita problemi di avvio del browser in alcuni ambienti locali.
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()

  // 🖨️ Inserisce nel browser un HTML completo con:
  //  - CSS Tailwind (se trovato)
  //  - CSS fallback (se non trovato)
  //  - contenuto in markdown convertito in HTML
  await page.setContent(
    `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>${css}</style>
      </head>
      <body class="bg-white">
        <!--
          .prose e .prose-slate funzionano solo se Tailwind PDF CSS è presente.
          Se non lo è, verrà comunque renderizzato pulito e leggibile.
        -->
        <main class="prose prose-slate max-w-none">${htmlContent}</main>
      </body>
    </html>
    `,
    { waitUntil: 'networkidle0' } // ⏳ Aspetta che la pagina sia completamente caricata
  )

  // 🧾 Genera il PDF in formato A4 includendo grafica e background CSS
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })

  await browser.close()

  // 🛠️ Conversione Buffer → ArrayBuffer, richiesta da Response()
  setHeader(event, 'Cache-Control', 'no-store')

  const arrayBuffer = pdfBuffer instanceof Buffer
    ? pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength)
    : pdfBuffer

  // 📦 Restituisce direttamente il PDF come allegato scaricabile
  return new Response(arrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="preventivo.pdf"',
    },
  })
})
