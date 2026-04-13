<template>
  <div class="cover-image">
    <div class="cover-image__left">
      <img :src="image" alt="" />
    </div>
    <div class="cover-image__right">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  image: { type: String, required: true },
})
</script>

<style scoped>
.cover-image {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  width: 100%;
}
.cover-image__left {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--slidev-theme-code-background);
}
.cover-image__left img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-image__right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem;
}
.cover-image__right :deep(h1) {
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 0.5rem;
}
.cover-image__right :deep(h3) {
  font-size: 1.1rem;
  font-weight: 400;
  color: var(--slidev-theme-accents-1);
}
</style>
