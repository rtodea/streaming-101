<template>
  <div class="cover-image" :class="`cover-image--image-${side}`">
    <div class="cover-image__image">
      <img :src="resolvedSrc" alt="" />
    </div>
    <div class="cover-image__text">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  image: { type: String, required: true },
  side: { type: String, default: 'left' },
})

// Frontmatter strings aren't rewritten by Vite the way template asset paths
// are, so a bare "/images/foo.jpg" would resolve to the site root instead of
// the Slidev base (e.g. "/slides/"). Prepend BASE_URL manually for relative
// paths; leave absolute URLs alone.
const resolvedSrc = computed(() => {
  const img = props.image
  if (/^https?:\/\//i.test(img)) return img
  const base = import.meta.env.BASE_URL || '/'
  return base.replace(/\/$/, '') + (img.startsWith('/') ? img : `/${img}`)
})
</script>

<style scoped>
.cover-image {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  width: 100%;
}
.cover-image__image {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--slidev-theme-code-background);
  grid-column: 1;
  grid-row: 1;
}
.cover-image--image-right .cover-image__image {
  grid-column: 2;
}
.cover-image__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-image__text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem;
  grid-column: 2;
  grid-row: 1;
}
.cover-image--image-right .cover-image__text {
  grid-column: 1;
}
.cover-image__text :deep(h1) {
  font-size: 2.4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 0.5rem;
}
.cover-image__text :deep(h3) {
  font-size: 1.1rem;
  font-weight: 400;
  color: var(--slidev-theme-accents-1);
}
</style>
