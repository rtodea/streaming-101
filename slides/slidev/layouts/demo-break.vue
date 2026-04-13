<template>
  <div class="demo-break">
    <div class="demo-break__icon">⟶</div>
    <h1 class="demo-break__title">{{ title }}</h1>
    <p v-if="url" class="demo-break__url">{{ url }}</p>
    <p class="demo-break__hint">Switch to the application</p>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Live Demo' },
  url: { type: String, default: '' },
})
</script>

<style scoped>
.demo-break {
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
.demo-break__icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}
.demo-break__title {
  font-size: 2.8rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
}
.demo-break__url {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.3rem;
  opacity: 0.7;
  margin-bottom: 1.5rem;
}
.demo-break__hint {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  opacity: 0.4;
}
</style>
