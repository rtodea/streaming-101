<template>
  <div class="slidev-layout next-adventure">
    <slot />
  </div>
</template>

<style scoped>
.next-adventure {
  padding: 2rem 3rem;
}
.next-adventure :deep(h1) {
  font-size: 1.6rem;
  text-align: center;
  margin-bottom: 2rem;
}
.next-adventure :deep(ul),
.next-adventure :deep(ol) {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.next-adventure :deep(li) {
  padding: 1rem 1.2rem;
  border: 1px solid var(--slidev-theme-border);
  border-radius: 8px;
  background: var(--slidev-theme-code-background);
}
.next-adventure :deep(li strong) {
  display: block;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}
</style>
