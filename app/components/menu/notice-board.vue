<script setup lang="ts">
const { can } = useAuth()
const { isInstalled } = useModules()
// The school's notices are part of the Communication module - without it the notice API is switched off.
const showNotices = computed(() =>
  isInstalled(ModuleKey.COMMUNICATION)
  && can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT, Role.ACCOUNTANT, Role.LIBRARIAN, Role.NURSE]))

// Messages from the system admin go to everyone who is signed in, in every school.
type Item = {
  id: string
  title: string
  content: string
  pinned: boolean
  platform: boolean
  severity?: AnnouncementSeverity
}

const isSystemAdmin = computed(() => can([Role.SYSTEM_ADMIN]))

const loading = ref(false)
const announcements = ref<PlatformAnnouncement[]>([])
const notices = ref<Notice[]>([])
const active = ref(0)
const detailOpen = ref(false)

// Platform announcements first (most serious first, as the server sorts them), then the school's own.
const items = computed<Item[]>(() => [
  ...announcements.value.map(a => ({
    id: `a-${a.id}`, title: a.title, content: a.message, pinned: false, platform: true, severity: a.severity
  })),
  ...notices.value.map(n => ({ id: n.id, title: n.title, content: n.content, pinned: n.pinned, platform: false }))
])

const visible = computed(() => showNotices.value || announcements.value.length > 0 || loading.value || isSystemAdmin.value)

let timer: ReturnType<typeof setInterval> | undefined
let refresher: ReturnType<typeof setInterval> | undefined

// "Important" = pinned or urgent first; if the school hasn't pinned/flagged
// anything yet, fall back to whatever's most recent so the slot isn't empty.
async function fetch() {
  loading.value = true
  try {
    const [live, res] = await Promise.all([
      AnnouncementApi().getActive(),
      showNotices.value ? NoticeApi().getAll(1, 10) as Promise<any> : Promise.resolve(null)
    ])
    announcements.value = live

    const all: Notice[] = res?.data || []
    const important = all.filter(n => n.pinned || n.category === 'URGENT')
    notices.value = (important.length ? important : all).slice(0, 5)
    active.value = 0
  } finally {
    loading.value = false
  }
}

function restart() {
  clearInterval(timer)
  if (items.value.length > 1) {
    timer = setInterval(() => {
      active.value = (active.value + 1) % items.value.length
    }, 5000)
  }
}

watch(items, restart)

onMounted(() => {
  fetch()
  // A new announcement (or a critical one) shouldn't wait for the next page load.
  refresher = setInterval(fetch, 5 * 60 * 1000)
})
onUnmounted(() => {
  clearInterval(timer)
  clearInterval(refresher)
})

const current = computed(() => items.value[active.value])

// What colour a platform announcement takes on the card.
const accent = computed(() => current.value?.platform ? announcementSeverity(current.value.severity!) : null)
const borderClass = computed(() => {
  switch (accent.value?.value) {
    case 'CRITICAL': return 'border-error/60 bg-error/5'
    case 'WARNING': return 'border-warning/60 bg-warning/5'
    default: return 'border-default hover:border-primary-300'
  }
})

const iconColor: Record<string, string> = { primary: 'text-primary', warning: 'text-warning', error: 'text-error' }

function open() {
  if (current.value?.platform) detailOpen.value = true
  else if (isSystemAdmin.value && !items.value.length) navigateTo('/announcements')
  else navigateTo('/communicate')
}
</script>

<template>
  <div
    v-if="visible"
    role="button"
    tabindex="0"
    class="group block w-full cursor-pointer overflow-hidden rounded-xl border px-3.5 py-3 transition-all duration-300"
    :class="borderClass"
    @click="open"
    @keydown.enter="open"
  >
    <div class="flex items-center justify-between gap-2">
      <div class="flex items-center gap-1.5">
        <span class="relative flex size-1.5">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span class="relative inline-flex size-1.5 rounded-full bg-primary" />
        </span>
        <p class="text-[11px] font-semibold uppercase tracking-wide text-muted">Notice Board</p>
        <UBadge v-if="current?.platform" size="xs" variant="subtle" :color="accent?.color" label="From Skultem" />
      </div>
      <UIcon name="i-lucide-chevron-right" class="size-3.5 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary" />
    </div>

    <div v-if="loading" class="mt-2 space-y-1.5">
      <USkeleton class="h-3 w-4/5" />
      <USkeleton class="h-2.5 w-3/5" />
    </div>

    <div v-else-if="current" class="mt-1.5 min-h-13">
      <Transition name="notice-slide" mode="out-in">
        <div :key="current.id">
          <div class="flex items-center gap-1.5">
            <UIcon v-if="current.platform && accent" :name="accent.icon" class="size-3.5 shrink-0"
              :class="iconColor[accent.color]" />
            <UIcon v-else-if="current.pinned" :name="PIN_ICON" class="size-3 shrink-0 text-primary" />
            <p class="truncate text-xs font-medium text-highlighted">{{ current.title }}</p>
          </div>
          <p class="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted">{{ current.content }}</p>
        </div>
      </Transition>

      <div v-if="items.length > 1" class="mt-2 flex items-center gap-1">
        <span
          v-for="(n, i) in items"
          :key="n.id"
          class="h-1 rounded-full transition-all duration-300"
          :class="i === active ? 'w-4 bg-primary' : 'w-1 bg-default'"
        />
      </div>
    </div>

    <p v-else class="mt-1.5 text-xs text-muted">
      {{ isSystemAdmin ? 'No live announcements. Tap to post one for every school.' : 'Nothing posted yet' }}
    </p>

    <!-- Every live announcement from Skultem, in full -->
    <UModal v-model:open="detailOpen" title="Announcements from Skultem"
      description="Messages for everyone using Skultem" :ui="{ content: 'max-w-lg' }">
      <template #body>
        <ul class="space-y-3" @click.stop>
          <li v-for="a in announcements" :key="a.id" class="rounded-xl border p-4"
            :class="a.severity === 'CRITICAL' ? 'border-error/40 bg-error/5' : a.severity === 'WARNING' ? 'border-warning/40 bg-warning/5' : 'border-default'">
            <div class="flex items-start gap-3">
              <UBadge :icon="announcementSeverity(a.severity).icon" :color="announcementSeverity(a.severity).color"
                variant="subtle" class="shrink-0 rounded-lg p-2" />
              <div class="min-w-0 space-y-1">
                <p class="text-sm font-semibold text-highlighted">{{ a.title }}</p>
                <p class="whitespace-pre-wrap text-sm text-toned">{{ a.message }}</p>
                <p class="text-xs text-muted">Posted {{ formatDateTime(a.startsAt || a.createdAt) }}<template v-if="a.endsAt"> · until {{ formatDateTime(a.endsAt) }}</template></p>
              </div>
            </div>
          </li>
        </ul>
      </template>
      <template v-if="isSystemAdmin" #footer>
        <UButton to="/announcements" label="Manage announcements" icon="i-lucide-megaphone" variant="soft" @click="detailOpen = false" />
      </template>
    </UModal>
  </div>
</template>

<style scoped>
.notice-slide-enter-active,
.notice-slide-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.notice-slide-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.notice-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
