<template>
  <div class="slidev-layout pros-cons">
    <div class="pros-cons__col">
      <h3 class="pros-cons__heading pros-cons__heading--pro">Pros</h3>
      <slot name="pros" />
    </div>
    <div class="pros-cons__col">
      <h3 class="pros-cons__heading pros-cons__heading--con">Cons</h3>
      <slot name="cons" />
    </div>
  </div>
</template>

<style scoped>
.pros-cons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem 3rem;
  align-items: start;
}
.pros-cons__heading {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--slidev-theme-border);
}
.pros-cons__heading--pro::before { content: '✓ '; }
.pros-cons__heading--con::before { content: '✗ '; }
.pros-cons__col :deep(ol),
.pros-cons__col :deep(ul) {
  list-style: none;
  padding: 0;
  counter-reset: item;
}
.pros-cons__col :deep(li) {
  counter-increment: item;
  padding: 0.4em 0;
  font-size: 1.05rem;
}
.pros-cons__col :deep(ol li)::before {
  content: counter(item) '. ';
  font-weight: 600;
  margin-right: 0.3em;
}
</style>
