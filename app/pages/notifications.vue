<script setup lang="ts">
const { error: toastError } = useNotify()

// Page and search are kept here, not in the URL.
const page = ref(1)

const days = ref(30)
const search = ref('')
const overview = ref<NotificationOverview>()
const rows = ref<BroadcastRecord[]>([])
const meta = ref<Meta>({} as Meta)
const loading = ref(false)
const failed = ref(false)

async function load() {
  loading.value = true
  failed.value = false
  try {
    const res = await SupportApi().broadcasts({ page: page.value, size: 10, search: search.value.trim() || undefined })
    rows.value = res?.data ?? []
    meta.value = res?.meta ?? ({} as Meta)
  } catch (err: any) {
    failed.value = true
    toastError(err.message)
  } finally {
    loading.value = false
  }
}

async function loadOverview() {
  overview.value = await SupportApi().notificationOverview(days.value).catch(() => undefined)
}

const TYPE_LABELS: Record<string, string> = {
  ATTENDANCE: 'Attendance', ANNOUNCEMENT: 'Announcements', REMINDER: 'Reminders', BEHAVIOUR: 'Behaviour', FEE: 'Fees', ASSESSMENT: 'Assessments'
}
const TYPE_ICONS: Record<string, string> = {
  ATTENDANCE: 'i-lucide-calendar-check', ANNOUNCEMENT: 'i-lucide-megaphone', REMINDER: 'i-lucide-alarm-clock',
  BEHAVIOUR: 'i-lucide-smile', FEE: 'i-lucide-wallet', ASSESSMENT: 'i-lucide-clipboard-check'
}
const CHANNEL_ICONS: Record<string, string> = { EMAIL: 'i-lucide-mail', SMS: 'i-lucide-message-square', IN_APP: 'i-lucide-bell', PUSH: 'i-lucide-smartphone' }
const periodText = computed(() => `the last ${days.value} days`)
const initial = (name: string) => (name || '?').trim().charAt(0).toUpperCase()
const whenOf = (r: BroadcastRecord) => r.status === 'SCHEDULED' && r.scheduledAt ? r.scheduledAt : (r.sentAt || r.createdAt)
const readRate = (created: number, read: number) => (created ? Math.round((read / created) * 100) : 0)

let timer: ReturnType<typeof setTimeout>
watch(search, () => { clearTimeout(timer); timer = setTimeout(() => { if (page.value !== 1) page.value = 1; else load() }, 350) })
watch(page, load)
watch(days, loadOverview)
onBeforeUnmount(() => clearTimeout(timer))

onMounted(() => {
  useAppStore().setTitle('System Admin · Notifications')
  useAppStore().setBack(false)
  document.title = 'Notifications | System Admin | Skultem'
  load()
  loadOverview()
})

definePageMeta({ role: [Role.SYSTEM_ADMIN] })
</script>

<template>
  <div class="space-y-5 px-4 md:px-6">
    <Heading title="Notifications" subtitle="What schools are sending to their parents, teachers and staff - and whether it is being read.">
      <USelect v-model="days" value-key="value" class="w-44" icon="i-lucide-calendar-range"
        :items="[{ label: 'Last 7 days', value: 7 }, { label: 'Last 30 days', value: 30 }, { label: 'Last 90 days', value: 90 }]" />
    </Heading>

    <!-- Summary -->
    <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div v-for="m in [
        { icon: 'i-lucide-megaphone', label: 'Broadcasts composed', value: overview?.broadcasts ?? 0, note: overview ? `${overview.scheduledBroadcasts} scheduled for later` : '' },
        { icon: 'i-lucide-bell', label: 'In-app notifications', value: overview?.inApp ?? 0, note: overview ? `${overview.inAppRead} opened` : '' },
        { icon: 'i-lucide-eye', label: 'Open rate', value: overview ? `${readRate(overview.inApp, overview.inAppRead)}%` : '0%', note: 'Of in-app notifications' },
        { icon: 'i-lucide-radio', label: 'Live announcements', value: overview?.announcements.live ?? 0, note: overview ? `${overview.announcements.scheduled} scheduled · ${overview.announcements.ended} ended` : '' },
      ]" :key="m.label" class="rounded-2xl border border-default bg-default p-4">
        <div class="flex items-center gap-2 text-xs text-muted"><UIcon :name="m.icon" class="size-4" />{{ m.label }}</div>
        <USkeleton v-if="!overview" class="mt-2 h-8 w-16" />
        <p v-else class="mt-1 text-3xl font-semibold leading-tight text-highlighted">{{ m.value }}</p>
        <p class="mt-0.5 text-xs text-muted">{{ m.note }}</p>
      </div>
    </section>

    <div class="grid items-start gap-5 xl:grid-cols-3">
      <!-- Broadcasts -->
      <UCard class="xl:col-span-2" :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 class="font-semibold text-highlighted">School broadcasts</h3>
              <p class="text-xs text-muted">Messages schools composed to their own people.</p>
            </div>
            <UInput v-model="search" icon="i-lucide-search" placeholder="Search title or school" class="w-full sm:w-64" />
          </div>
        </template>

        <UAlert v-if="failed" color="error" variant="soft" icon="i-lucide-circle-alert" title="Broadcasts could not be loaded" class="m-4">
          <template #actions><UButton size="xs" color="error" variant="outline" label="Try again" @click="load" /></template>
        </UAlert>

        <template v-else>
          <div v-if="loading" class="space-y-3 p-4"><USkeleton v-for="i in 5" :key="i" class="h-16 w-full rounded-xl" /></div>

          <div v-else-if="!rows.length" class="flex flex-col items-center gap-2 py-14">
            <div class="flex size-14 items-center justify-center rounded-2xl bg-elevated text-muted"><UIcon name="i-lucide-megaphone" class="size-7" /></div>
            <p class="text-sm font-medium text-highlighted">{{ search ? 'No broadcast matches your search' : 'No broadcasts yet' }}</p>
            <p class="text-xs text-muted">{{ search ? 'Try a different title or school.' : 'They appear here when a school sends one.' }}</p>
          </div>

          <ul v-else class="divide-y divide-default">
            <li v-for="r in rows" :key="r.id" class="flex items-start gap-3 px-4 py-3.5 transition hover:bg-elevated/50">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-elevated text-sm font-semibold text-toned">
                {{ initial(r.schoolName) }}
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <p class="truncate text-sm font-semibold text-highlighted">{{ r.title }}</p>
                  <UBadge size="sm" variant="subtle" :color="r.status === 'SCHEDULED' ? 'warning' : 'neutral'"
                    :icon="r.status === 'SCHEDULED' ? 'i-lucide-clock' : 'i-lucide-check'" :label="r.status === 'SCHEDULED' ? 'Scheduled' : 'Composed'" />
                </div>
                <p class="truncate text-xs text-muted">{{ clean(r.schoolName) }}<template v-if="r.sentByName"> · {{ r.sentByName }}</template></p>
                <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <span class="inline-flex items-center gap-1"><UIcon name="i-lucide-users" class="size-3.5" />
                    {{ r.audience.charAt(0) + r.audience.slice(1).toLowerCase() }} · {{ r.recipients }} recipient{{ r.recipients === 1 ? '' : 's' }}</span>
                  <span v-for="c in r.channels" :key="c" class="inline-flex items-center gap-1 rounded-md bg-elevated px-1.5 py-0.5">
                    <UIcon :name="CHANNEL_ICONS[c] ?? 'i-lucide-send'" class="size-3" />{{ c.replace('_', ' ') }}
                  </span>
                  <span class="ml-auto inline-flex items-center gap-1"><UIcon name="i-lucide-calendar" class="size-3.5" />{{ formatDateTime(whenOf(r)) }}</span>
                </div>
              </div>
            </li>
          </ul>
        </template>

        <template #footer>
          <div class="flex items-center justify-between">
            <Showing :meta="meta" />
            <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total" show-edges />
          </div>
        </template>
      </UCard>

      <!-- Side -->
      <div class="space-y-5">
        <NuxtLink to="/announcements" class="group flex items-center gap-3 rounded-2xl border border-default bg-default p-4 transition hover:border-accented">
          <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-elevated text-muted"><UIcon name="i-lucide-megaphone" class="size-5" /></div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-highlighted">Platform announcements</p>
            <p class="text-xs text-muted">Write a message every user of every school will see.</p>
          </div>
          <UIcon name="i-lucide-arrow-right" class="size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary" />
        </NuxtLink>

        <UCard>
          <template #header>
            <div>
              <h3 class="font-semibold text-highlighted">In-app notifications by type</h3>
              <p class="text-xs text-muted">How many were created, and how many were opened.</p>
            </div>
          </template>
          <p v-if="!overview?.byType.length" class="py-6 text-center text-sm text-muted">Nothing was sent in {{ periodText }}.</p>
          <ul v-else class="space-y-4">
            <li v-for="t in overview.byType" :key="t.type" class="flex items-center gap-3">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-elevated text-muted"><UIcon :name="TYPE_ICONS[t.type] ?? 'i-lucide-bell'" class="size-4" /></div>
              <div class="min-w-0 flex-1 space-y-1.5">
                <div class="flex items-center justify-between text-sm"><span class="font-medium text-highlighted">{{ TYPE_LABELS[t.type] ?? t.type }}</span><span class="text-muted">{{ t.created }}</span></div>
                <UProgress :model-value="readRate(t.created, t.read)" size="sm" color="primary" />
                <p class="text-[11px] text-muted">{{ readRate(t.created, t.read) }}% opened · {{ t.read }} of {{ t.created }}</p>
              </div>
            </li>
          </ul>
        </UCard>
      </div>
    </div>
  </div>
</template>
