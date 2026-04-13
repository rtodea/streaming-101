<template>
  <div class="full-image">
    <img :src="image" :alt="alt" />
  </div>
</template>

<script setup>
defineProps({
  image: { type: String, required: true },
  alt: { type: String, default: '' },
})
</script>

<style scoped>
.full-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
  background: #fff;
}
.full-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
