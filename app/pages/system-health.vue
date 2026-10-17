<script setup lang="ts">
const { error: toastError } = useNotify()

const health = ref<PlatformHealth>()
const loading = ref(true)
const refreshing = ref(false)
const failed = ref(false)

async function load(manual = false) {
  if (manual) refreshing.value = true
  failed.value = false
  try {
    health.value = await SupportApi().health()
  } catch (err: any) {
    failed.value = true
    if (manual) toastError(err.message)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const LEVELS: Record<HealthLevel, { label: string, color: 'success' | 'warning' | 'error' | 'neutral', icon: string }> = {
  OK: { label: 'Healthy', color: 'success', icon: 'i-lucide-circle-check' },
  WARNING: { label: 'Needs a look', color: 'warning', icon: 'i-lucide-triangle-alert' },
  FAILED: { label: 'Failing', color: 'error', icon: 'i-lucide-circle-x' },
  NOT_TRACKED: { label: 'Not tracked', color: 'neutral', icon: 'i-lucide-circle-help' }
}

type LevelColor = 'success' | 'warning' | 'error' | 'neutral'

const CHECK_ICONS: Record<string, string> = {
  api: 'i-lucide-server', database: 'i-lucide-database', migrations: 'i-lucide-database-zap',
  storage: 'i-lucide-hard-drive', failures: 'i-lucide-octagon-alert', email: 'i-lucide-mail', jobs: 'i-lucide-timer'
}

// Problems first, then what is healthy; what can't be measured goes in its own, quieter group.
const RANK: Record<HealthLevel, number> = { FAILED: 0, WARNING: 1, OK: 2, NOT_TRACKED: 3 }
const monitored = computed(() => (health.value?.checks ?? []).filter(c => c.level !== 'NOT_TRACKED').sort((a, b) => RANK[a.level] - RANK[b.level]))
const notTracked = computed(() => (health.value?.checks ?? []).filter(c => c.level === 'NOT_TRACKED'))
const count = (level: HealthLevel) => (health.value?.checks ?? []).filter(c => c.level === level).length

const HEADLINE: Partial<Record<HealthLevel, string>> & { OK: string } = {
  OK: 'All monitored systems operational',
  WARNING: 'Something needs a look',
  FAILED: 'Something is failing'
}

const latencyClass = (ms: number | null, warnAt: number) => ms !== null && ms > warnAt ? 'text-warning' : 'text-success'

const COUNT_CLASS: Record<HealthLevel, string> = { OK: 'text-highlighted', NOT_TRACKED: 'text-highlighted', WARNING: 'text-warning', FAILED: 'text-error' }

const memory = computed(() => {
  const r = health.value?.runtime
  const pct = r && r.memoryMaxMb ? Math.round((r.memoryUsedMb / r.memoryMaxMb) * 100) : 0
  return { pct, color: (pct >= 90 ? 'error' : pct >= 75 ? 'warning' : 'primary') as 'error' | 'warning' | 'primary' }
})

// "Checked 12s ago", ticking.
const now = ref(Date.now())
const ago = computed(() => {
  if (!health.value) return ''
  const s = Math.max(0, Math.round((now.value - new Date(health.value.checkedAt).getTime()) / 1000))
  return s < 5 ? 'just now' : s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`
})

const uptime = (s: number) => {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60)
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`
}

// Re-checked every minute while the page is open.
let timer: ReturnType<typeof setInterval>
let tick: ReturnType<typeof setInterval>
onMounted(() => {
  useAppStore().setTitle('System Admin · System Health')
  useAppStore().setBack(false)
  document.title = 'System Health | System Admin | Skultem'
  load()
  timer = setInterval(() => load(), 60000)
  tick = setInterval(() => { now.value = Date.now() }, 1000)
})
onBeforeUnmount(() => { clearInterval(timer); clearInterval(tick) })

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-5 px-4 md:px-6">
    <Heading title="System Health" subtitle="Monitor platform availability, dependencies and background operations.">
      <UButton icon="i-lucide-refresh-cw" label="Check now" :loading="refreshing" @click="load(true)" />
    </Heading>

    <UAlert v-if="failed" color="error" variant="soft" icon="i-lucide-circle-alert" title="The health check could not run"
      description="If the backend is down this page can't report on it - check the server directly.">
      <template #actions><UButton size="xs" color="error" variant="outline" label="Try again" @click="load(true)" /></template>
    </UAlert>

    <div v-if="loading" class="space-y-4">
      <USkeleton class="h-36 rounded-3xl" />
      <div class="grid gap-4 lg:grid-cols-2"><USkeleton v-for="i in 4" :key="i" class="h-28 rounded-2xl" /></div>
    </div>

    <template v-else-if="health">
      <!-- Overall: neutral card, colour only for the status itself -->
      <section class="rounded-2xl border border-default bg-default p-5">
        <div class="flex flex-wrap items-center justify-between gap-5">
          <div class="flex items-center gap-4">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-full"
              :class="{ 'bg-success/10 text-success': health.overall === 'OK', 'bg-warning/10 text-warning': health.overall === 'WARNING', 'bg-error/10 text-error': health.overall === 'FAILED' }">
              <UIcon :name="LEVELS[health.overall].icon" class="size-6" />
            </div>
            <div>
              <p class="text-lg font-semibold text-highlighted">{{ HEADLINE[health.overall] ?? HEADLINE.OK }}</p>
              <p class="mt-0.5 text-xs text-muted">Checked {{ ago }} · refreshes every minute</p>
            </div>
          </div>

          <div class="flex divide-x divide-default">
            <div v-for="l in (['OK', 'WARNING', 'FAILED', 'NOT_TRACKED'] as HealthLevel[])" :key="l"
              v-show="l === 'OK' || l === 'NOT_TRACKED' || count(l)" class="px-5 text-center first:pl-0 last:pr-0">
              <p class="text-2xl font-semibold" :class="count(l) ? COUNT_CLASS[l] : 'text-highlighted'">{{ count(l) }}</p>
              <p class="text-xs text-muted">{{ LEVELS[l].label }}</p>
            </div>
          </div>
        </div>
      </section>

      <div class="grid items-start gap-5 lg:grid-cols-2">
        <!-- Monitored -->
        <div class="space-y-3">
          <p class="px-1 text-xs font-semibold uppercase tracking-wider text-muted">Monitored</p>
          <article v-for="c in monitored" :key="c.key"
            class="rounded-2xl border bg-default p-4"
            :class="c.level === 'FAILED' ? 'border-error/40' : c.level === 'WARNING' ? 'border-warning/40' : 'border-default'">
            <div class="flex items-start gap-4">
              <div class="flex size-11 shrink-0 items-center justify-center rounded-xl"
                :class="c.level === 'OK' ? 'bg-elevated text-toned' : c.level === 'WARNING' ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'">
                <UIcon :name="CHECK_ICONS[c.key] ?? 'i-lucide-activity'" class="size-5" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <p class="font-semibold text-highlighted">{{ c.label }}</p>
                  <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="{ 'bg-success/10 text-success': c.level === 'OK', 'bg-warning/10 text-warning': c.level === 'WARNING', 'bg-error/10 text-error': c.level === 'FAILED' }">
                    <span class="size-1.5 rounded-full bg-current" />{{ LEVELS[c.level].label }}
                  </span>
                </div>
                <p class="mt-1 text-sm text-muted">{{ c.detail }}</p>
                <p v-if="c.latencyMs !== null" class="mt-2 inline-flex items-center gap-1 rounded-md bg-elevated px-2 py-0.5 text-xs"
                  :class="latencyClass(c.latencyMs, c.key === 'storage' ? 2000 : 500)">
                  <UIcon name="i-lucide-gauge" class="size-3.5" /> {{ c.latencyMs }} ms
                </p>
              </div>
            </div>
          </article>
        </div>

        <div class="space-y-5">
          <!-- Server -->
          <section class="space-y-3">
            <p class="px-1 text-xs font-semibold uppercase tracking-wider text-muted">Server resources</p>
            <div class="rounded-2xl border border-default bg-default p-5">
              <div class="flex items-end justify-between gap-3">
                <div>
                  <p class="flex items-center gap-1.5 text-xs text-muted"><UIcon name="i-lucide-memory-stick" class="size-4" /> Memory</p>
                  <p class="mt-1 text-2xl font-semibold text-highlighted">{{ health.runtime.memoryUsedMb }}<span class="text-sm font-normal text-muted"> MB of {{ health.runtime.memoryMaxMb }} MB</span></p>
                </div>
                <p class="text-lg font-semibold" :class="memory.pct >= 90 ? 'text-error' : memory.pct >= 75 ? 'text-warning' : 'text-muted'">{{ memory.pct }}%</p>
              </div>
              <UProgress class="mt-3" :model-value="memory.pct" :color="memory.color" size="md" />

              <div class="mt-5 grid grid-cols-3 gap-3">
                <div class="rounded-xl bg-elevated p-3">
                  <UIcon name="i-lucide-clock" class="size-4 text-muted" />
                  <p class="mt-2 text-lg font-semibold text-highlighted">{{ uptime(health.runtime.uptimeSeconds) }}</p>
                  <p class="text-xs text-muted">Uptime</p>
                </div>
                <div class="rounded-xl bg-elevated p-3">
                  <UIcon name="i-lucide-cpu" class="size-4 text-muted" />
                  <p class="mt-2 text-lg font-semibold text-highlighted">{{ health.runtime.processors }}</p>
                  <p class="text-xs text-muted">Processors</p>
                </div>
                <div class="rounded-xl bg-elevated p-3">
                  <UIcon name="i-lucide-coffee" class="size-4 text-muted" />
                  <p class="mt-2 truncate text-lg font-semibold text-highlighted">{{ health.runtime.java }}</p>
                  <p class="text-xs text-muted">Java</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Not measured -->
          <section v-if="notTracked.length" class="space-y-3">
            <p class="px-1 text-xs font-semibold uppercase tracking-wider text-muted">Not monitored yet</p>
            <div class="divide-y divide-default rounded-2xl border border-dashed border-accented bg-default/60">
              <div v-for="c in notTracked" :key="c.key" class="flex items-start gap-3 p-4">
                <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-elevated text-muted">
                  <UIcon :name="CHECK_ICONS[c.key] ?? 'i-lucide-activity'" class="size-4" />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-highlighted">{{ c.label }}</p>
                  <p class="text-xs text-muted">{{ c.detail }}</p>
                </div>
              </div>
            </div>
            <p class="px-1 text-xs text-muted">These can't be measured yet, so no status is shown rather than a guess.</p>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>
