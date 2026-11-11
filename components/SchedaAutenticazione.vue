<script setup>
defineProps({
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' }
})
</script>

<template>
  <main class="auth-page app-page-background">
    <div class="auth-page__texture" aria-hidden="true"></div>

    <section class="auth-card" aria-labelledby="auth-title">
      <header class="auth-card__header">
        <p class="auth-card__eyebrow">{{ eyebrow }}</p>
        <h1 id="auth-title" class="auth-card__title">{{ title }}</h1>
        <p v-if="description" class="auth-card__description">{{ description }}</p>
      </header>

      <div class="auth-card__content">
        <slot />
      </div>

      <footer class="auth-card__footer">
        <slot name="footer">
          <NuxtLink to="/" class="auth-link auth-link--muted">← Torna alla home</NuxtLink>
        </slot>
      </footer>
    </section>
  </main>
</template>
