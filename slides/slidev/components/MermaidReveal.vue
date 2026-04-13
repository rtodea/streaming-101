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
const elements = ref([])
const diagramId = `mermaid-reveal-${Math.random().toString(36).slice(2, 9)}`

const totalSteps = computed(() => props.steps || elements.value.length)

function detectElements(svg) {
  const els = []
  const source = props.diagram.trim()

  if (source.startsWith('sequenceDiagram')) {
    // Sequence diagrams: select message lines + labels
    const messages = svg.querySelectorAll('.messageText, .messageLine0, .messageLine1')
    // Group by message pairs (line + text)
    const groups = new Map()
    messages.forEach((el) => {
      // Messages share y-position proximity — group by vertical offset
      const y = Math.round(el.getBBox?.()?.y ?? parseFloat(el.getAttribute('y') ?? '0'))
      const bucket = Math.round(y / 10) * 10
      if (!groups.has(bucket)) groups.set(bucket, [])
      groups.get(bucket).push(el)
    })

    // Also grab activation rects if present
    const activations = svg.querySelectorAll('.activation0, .activation1, .activation2')
    activations.forEach((el) => {
      const y = Math.round(el.getBBox?.()?.y ?? parseFloat(el.getAttribute('y') ?? '0'))
      const bucket = Math.round(y / 10) * 10
      if (groups.has(bucket)) {
        groups.get(bucket).push(el)
      }
    })

    // Sort by y-position (top to bottom = chronological order)
    const sorted = [...groups.entries()].sort((a, b) => a[0] - b[0])
    sorted.forEach(([, group]) => els.push(group))

    // Also collect loop/alt boxes and their labels
    const loops = svg.querySelectorAll('.loopText, .loopLine, .labelBox, .labelText')
    if (loops.length > 0) {
      els.push([...loops])
    }
  } else {
    // Flowcharts / graph diagrams: select nodes then edges
    const nodes = svg.querySelectorAll('.node')
    const edges = svg.querySelectorAll('.edgePath, .edgeLabel')

    // Interleave: first node, then edges connecting to it, etc.
    // Simple approach: nodes first, then edges
    nodes.forEach((el) => els.push([el]))
    edges.forEach((el) => els.push([el]))
  }

  return els
}

async function render() {
  if (!container.value) return

  mermaid.initialize({
    startOnLoad: false,
    theme: 'neutral',
    fontFamily: 'Inter, sans-serif',
    sequence: {
      actorFontFamily: 'Inter, sans-serif',
      messageFontFamily: 'Inter, sans-serif',
      noteFontFamily: 'Inter, sans-serif',
    },
  })

  try {
    const { svg } = await mermaid.render(diagramId, props.diagram.trim())
    container.value.innerHTML = svg

    const svgEl = container.value.querySelector('svg')
    if (!svgEl) return

    // Detect interactive elements
    elements.value = detectElements(svgEl)

    // Initial state: hide all elements
    updateVisibility()
  } catch (err) {
    container.value.innerHTML = `<pre class="mermaid-reveal__error">${err.message}</pre>`
  }
}

function updateVisibility() {
  const currentClicks = clicks.value ?? 0
  elements.value.forEach((group, i) => {
    const visible = i < currentClicks
    group.forEach((el) => {
      el.style.opacity = visible ? '1' : '0'
      el.style.transition = 'opacity 0.3s ease'
    })
  })
}

onMounted(render)
watch(clicks, updateVisibility)
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
  max-width: 100%;
  max-height: 80vh;
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
