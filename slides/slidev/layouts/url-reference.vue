<template>
  <div class="slidev-layout url-reference">
    <slot />
  </div>
</template>

<style scoped>
.url-reference {
  padding: 2rem 3rem;
}
.url-reference :deep(h1) {
  font-size: 1.6rem;
  margin-bottom: 1.5rem;
}
.url-reference :deep(ul),
.url-reference :deep(ol) {
  list-style: none;
  padding: 0;
}
.url-reference :deep(li) {
  padding: 0.8em 0;
  border-bottom: 1px solid var(--slidev-theme-border);
}
.url-reference :deep(li:last-child) {
  border-bottom: none;
}
.url-reference :deep(a) {
  color: var(--slidev-theme-text);
  text-decoration: none;
  font-weight: 600;
}
.url-reference :deep(a:hover) {
  text-decoration: underline;
}
</style>
