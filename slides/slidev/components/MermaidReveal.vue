<template>
  <div ref="container" class="mermaid-reveal" />
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useNav } from '@slidev/client'
import mermaid from 'mermaid'

const props = defineProps({
  diagram: { type: String, required: true },
  steps: { type: Number, default: 0 },
})

const container = ref(null)
const { clicks } = useNav()

// Parse diagram into header (type + participants) and interaction lines.
// Only sequenceDiagram is split into reveal steps. Other diagram types
// (flowchart, stateDiagram, classDiagram, etc.) render as a single SVG —
// their layout depends on the full graph, so progressive reveal would just
// produce broken intermediate frames.
function parseDiagram(source) {
  const lines = source.trim().split('\n')
  const firstNonEmpty = lines.find(l => l.trim() !== '') || ''
  const isSequence = firstNonEmpty.trim() === 'sequenceDiagram'

  if (!isSequence) {
    return { header: lines, interactions: [], isSequence: false }
  }

  const header = []
  const interactions = []
  const arrowPattern = /^\s*\S+\s*->>|^\s*\S+\s*-->>|^\s*\S+\s*->|^\s*\S+\s*-->/

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === 'sequenceDiagram') {
      header.push(line)
    } else if (trimmed.startsWith('participant') || trimmed.startsWith('actor') || trimmed === '') {
      header.push(line)
    } else if (arrowPattern.test(trimmed)) {
      interactions.push(line)
    } else if (trimmed.startsWith('Note') || trimmed.startsWith('note')) {
      interactions.push(line)
    } else if (trimmed.startsWith('loop') || trimmed.startsWith('alt') || trimmed.startsWith('opt') || trimmed === 'end' || trimmed.startsWith('else')) {
      interactions.push(line)
    } else {
      header.push(line)
    }
  }

  return { header, interactions, isSequence: true }
}

const parsed = computed(() => parseDiagram(props.diagram))
const totalSteps = computed(() => {
  if (!parsed.value.isSequence) return 0
  return props.steps || parsed.value.interactions.length
})

// Build diagram source showing only the first N interactions
function buildPartialDiagram(stepCount) {
  const { header, interactions } = parsed.value
  const visibleInteractions = interactions.slice(0, stepCount)
  return [...header, ...visibleInteractions].join('\n')
}

let renderCounter = 0

async function renderAtStep() {
  if (!container.value) return

  const currentClicks = clicks.value ?? 0
  const visibleSteps = Math.min(Math.max(currentClicks, 0), totalSteps.value)

  mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral',
    fontFamily: 'Inter, sans-serif',
    sequence: {
      actorFontFamily: 'Inter, sans-serif',
      messageFontFamily: 'Inter, sans-serif',
      noteFontFamily: 'Inter, sans-serif',
      useMaxWidth: false,
      width: 180,
      height: 40,
    },
  })

  // Non-sequence diagrams render the full source — their layout requires
  // every node and edge to be present at once, so step-by-step reveal
  // would just produce broken intermediate frames. Sequence diagrams keep
  // the existing per-click animation: header (cast) at step 0, then one
  // arrow per click.
  const source = !parsed.value.isSequence
    ? props.diagram
    : visibleSteps === 0
      ? parsed.value.header.join('\n')
      : buildPartialDiagram(visibleSteps)

  // Each render needs a unique ID for mermaid
  renderCounter++
  const diagramId = `mermaid-reveal-${renderCounter}-${Math.random().toString(36).slice(2, 7)}`

  try {
    const { svg } = await mermaid.render(diagramId, source)
    container.value.innerHTML = svg
  } catch (err) {
    container.value.innerHTML = `<pre class="mermaid-reveal__error">${err.message}</pre>`
  }
}

onMounted(renderAtStep)
watch(clicks, renderAtStep)
</script>

<style scoped>
.mermaid-reveal {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 1rem;
}
.mermaid-reveal :deep(svg) {
  max-width: 90%;
  max-height: 65vh;
}
.mermaid-reveal__error {
  color: #c00;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  padding: 1rem;
  background: #fff0f0;
  border-radius: 6px;
}
</style>
