<template>
  <div class="section-break">
    <p v-if="kicker" class="section-break__kicker">{{ kicker }}</p>
    <h1 class="section-break__title">{{ frontmatter?.title || 'Section' }}</h1>
    <p v-if="subtitle" class="section-break__subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  frontmatter: { type: Object, default: () => ({}) },
  subtitle: { type: String, default: '' },
  kicker: { type: String, default: 'Up next' },
})
</script>

<style scoped>
.section-break {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  background: #111;
  color: #fff;
  text-align: center;
  padding: 3rem;
}
.section-break__kicker {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  opacity: 0.45;
  margin-bottom: 1.4rem;
}
.section-break__title {
  font-size: 3.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
}
.section-break__subtitle {
  font-size: 1.1rem;
  opacity: 0.65;
  max-width: 60%;
  line-height: 1.4;
}
</style>
