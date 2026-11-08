<!-- Draws the active page guide (usePageGuide): dims the page, cuts a highlight around the part a step is about,
     and shows the step's card beside it (docked at the bottom on phones). Mounted once in the layout. -->
<template>
  <Teleport to="body">
    <!-- pointer-events: auto - an open side panel or modal turns clicks off outside itself, and a guide about a
         form inside it still needs its buttons to work. -->
    <div v-if="guide && step" class="pointer-events-auto fixed inset-0 z-[100]" style="pointer-events: auto"
      role="dialog" aria-modal="true" :aria-label="guide.title"
      @keydown.esc="finish">
      <!-- Dimmed page with a hole over the highlighted part (or just dimmed for a centred step). -->
      <div v-if="rect" class="pointer-events-none absolute rounded-xl ring-2 ring-primary transition-all duration-300 ease-out"
        :style="{
          top: `${rect.top - pad}px`, left: `${rect.left - pad}px`,
          width: `${rect.width + pad * 2}px`, height: `${rect.height + pad * 2}px`,
          boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.55)',
        }" />
      <div v-else class="absolute inset-0 bg-slate-900/55" />

      <!-- Clicks outside the card don't fall through to the page while the guide is open. -->
      <div class="absolute inset-0" @click.self="() => {}" />

      <div ref="cardRef" style="pointer-events: auto"
        class="absolute w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-default bg-default p-4 shadow-2xl transition-all duration-300 ease-out"
        :style="cardStyle">
        <div class="mb-2 flex items-center justify-between gap-2">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-primary">
            {{ guide.title }} · {{ position + 1 }} of {{ visibleCount }}
          </p>
          <UButton icon="i-lucide-x" size="xs" color="neutral" variant="ghost" aria-label="Close guide" @click="finish" />
        </div>
        <h3 class="font-semibold text-highlighted">{{ step.title }}</h3>
        <p class="mt-1 text-sm text-muted">{{ step.body }}</p>

        <!-- Progress dots -->
        <div class="mt-3 flex gap-1">
          <span v-for="i in visibleCount" :key="i" class="h-1.5 rounded-full transition-all"
            :class="i - 1 === position ? 'w-5 bg-primary' : 'w-1.5 bg-elevated'" />
        </div>

        <div class="mt-4 flex items-center justify-between gap-2">
          <UButton v-if="position < visibleCount - 1" size="sm" color="neutral" variant="link" class="px-0"
            label="Skip guide" @click="finish" />
          <span v-else />
          <div class="flex gap-2">
            <UButton v-if="position > 0" size="sm" color="neutral" variant="outline" label="Back" @click="go(-1)" />
            <UButton size="sm" :label="position < visibleCount - 1 ? 'Next' : 'Done'"
              :trailing-icon="position < visibleCount - 1 ? 'i-lucide-arrow-right' : 'i-lucide-check'" @click="go(1)" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { active, finish } = usePageGuide()
const route = useRoute()

const pad = 6
const rect = ref<{ top: number, left: number, width: number, height: number } | null>(null)
const cardRef = ref<HTMLElement | null>(null)
const cardSize = ref({ width: 352, height: 220 })
const viewport = ref({ width: 1280, height: 800 })

const guide = computed(() => (active.value ? PAGE_GUIDES[active.value.id] ?? null : null))

// Steps whose part is on screen (or that need no part) - the rest are skipped.
const visibleSteps = ref<number[]>([])
const visibleCount = computed(() => visibleSteps.value.length)
const position = computed(() => Math.max(0, visibleSteps.value.indexOf(active.value?.index ?? 0)))
const step = computed(() => (guide.value && active.value ? guide.value.steps[active.value.index] ?? null : null))

function targetOf(index: number): HTMLElement | null {
  const target = guide.value?.steps[index]?.target
  if (!target) return null
  // A page can draw a part twice (a phone layout and a desktop one) - use the copy that's showing.
  const all = Array.from(document.querySelectorAll(`[data-guide="${target}"]`)) as HTMLElement[]
  return all.find((el) => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0
  }) ?? null
}

function computeVisible() {
  if (!guide.value) return
  visibleSteps.value = guide.value.steps
    .map((s, i) => (!s.target || targetOf(i) ? i : -1))
    .filter(i => i >= 0)
}

async function place(scroll = true) {
  viewport.value = { width: window.innerWidth, height: window.innerHeight }
  const el = active.value ? targetOf(active.value.index) : null
  if (el && scroll) {
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    await new Promise(r => setTimeout(r, 350))
  }
  if (el) {
    const r = el.getBoundingClientRect()
    rect.value = { top: r.top, left: r.left, width: r.width, height: r.height }
  } else {
    rect.value = null
  }
  await nextTick()
  if (cardRef.value) cardSize.value = { width: cardRef.value.offsetWidth, height: cardRef.value.offsetHeight }
}

// Below the part if it fits, else above, else beside it - always kept on screen. Phones dock it at the bottom.
const cardStyle = computed(() => {
  const vw = viewport.value.width
  const vh = viewport.value.height
  const { width, height } = cardSize.value
  const margin = 16
  if (!rect.value) {
    return { top: `${Math.max(margin, (vh - height) / 2)}px`, left: `${Math.max(margin, (vw - width) / 2)}px` }
  }
  if (vw < 640) {
    return { left: `${margin}px`, right: `${margin}px`, bottom: `${margin}px`, width: 'auto' }
  }
  const r = rect.value
  const clampLeft = (x: number) => Math.min(Math.max(margin, x), vw - width - margin)
  const below = r.top + r.height + pad + 12
  const above = r.top - pad - 12 - height
  let top: number
  let left = clampLeft(r.left + r.width / 2 - width / 2)
  if (below + height <= vh - margin) top = below
  else if (above >= margin) top = above
  else {
    // Beside it: the side with more room.
    top = Math.min(Math.max(margin, r.top + r.height / 2 - height / 2), vh - height - margin)
    const right = r.left + r.width + pad + 12
    left = right + width <= vw - margin ? right : clampLeft(r.left - pad - 12 - width)
  }
  return { top: `${top}px`, left: `${left}px` }
})

function go(delta: number) {
  if (!active.value) return
  computeVisible()
  const next = visibleSteps.value[position.value + delta]
  if (next === undefined) {
    if (delta > 0) finish()
    return
  }
  active.value = { ...active.value, index: next }
}

function onKey(e: KeyboardEvent) {
  if (!active.value) return
  if (e.key === 'Escape') finish()
  else if (e.key === 'ArrowRight' || e.key === 'Enter') go(1)
  else if (e.key === 'ArrowLeft') go(-1)
}

function onResize() {
  if (active.value) place(false)
}

watch(active, async (value, previous) => {
  if (!value) {
    rect.value = null
    return
  }
  if (!previous || previous.id !== value.id) {
    computeVisible()
    // Start on the first step that can show.
    if (!visibleSteps.value.includes(value.index) && visibleSteps.value.length) {
      active.value = { ...value, index: visibleSteps.value[0]! }
      return
    }
  }
  await place()
}, { deep: true })

// Leaving the page closes its guide (without marking it seen, so it shows next time).
watch(() => route.path, () => { active.value = null })

onMounted(() => {
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize)
  window.addEventListener('scroll', onResize, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onResize)
  window.removeEventListener('scroll', onResize, true)
})
</script>
