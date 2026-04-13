<template>
  <div class="slidev-layout quote-layout">
    <blockquote class="quote-layout__text">
      <slot />
    </blockquote>
    <div class="quote-layout__attribution">
      <span class="quote-layout__author">— {{ author }}</span>
      <span v-if="source" class="quote-layout__source">{{ source }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  author: { type: String, required: true },
  source: { type: String, default: '' },
})
</script>

<style scoped>
.quote-layout {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 4rem;
  text-align: center;
}
.quote-layout__text {
  font-size: 1.8rem;
  font-style: italic;
  font-weight: 400;
  line-height: 1.4;
  max-width: 40ch;
  margin: 0;
  border: none;
  padding: 0;
}
.quote-layout__text::before { content: '\201C'; }
.quote-layout__text::after { content: '\201D'; }
.quote-layout__attribution {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
.quote-layout__author {
  font-size: 1.1rem;
  font-weight: 600;
}
.quote-layout__source {
  font-size: 0.9rem;
  color: var(--slidev-theme-accents-2);
}
</style>
