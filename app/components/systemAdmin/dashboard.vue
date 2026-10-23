<script setup lang="ts">
const store = useSystemStore();
const { stats, statsLoading, insights, insightsLoading, demoRequests, demoRequestsMeta, demoRequestsLoading } = storeToRefs(store);

// The period the growth numbers and demo count cover. Chosen here, not in the URL.
const periods = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
  { label: 'Last 12 months', value: 365 },
];
const days = ref(30);
const periodText = computed(() => {
  const d = insights.value?.days ?? days.value;
  return d === 365 ? 'the last 12 months' : `the last ${d} days`;
});

const failed = ref(false);
const money = useMoney();
const collections = ref<PlatformFeeCollections>();

async function load() {
  failed.value = false;
  try {
    await Promise.all([store.fetchStats(), store.fetchInsights(days.value), store.fetchDemoRequests(1, 5)]);
    // Only for admins who can see billing - the server refuses everyone else, which just leaves the tile out.
    if (usePlatformAccess().can('BILLING')) collections.value = await PlatformApi().feeCollections().catch(() => undefined);
  } catch {
    failed.value = true;
  }
}

watch(days, () => store.fetchInsights(days.value).catch(() => (failed.value = true)));

onMounted(async () => {
  useAppStore().setTitle("System Admin");
  useAppStore().setBack(false);
  document.title = "System Admin | Skultem";

  await load();
});

// "+3 vs the period before" - how a count moved against the previous period of the same length.
function trend(delta?: InsightDelta) {
  if (!delta) return { text: '', color: 'neutral' as const }
  const diff = delta.current - delta.previous
  const sign = diff > 0 ? '+' : ''
  return {
    text: `${delta.current} in ${periodText.value} (${diff === 0 ? 'no change' : `${sign}${diff}`})`,
    color: (diff > 0 ? 'success' : diff < 0 ? 'warning' : 'neutral') as 'success' | 'warning' | 'neutral'
  }
}

const monthLabels = computed(() =>
  (insights.value?.monthly ?? []).map(m => {
    const [y, mo] = m.month.split('-').map(Number)
    return new Date(y!, mo! - 1, 1).toLocaleDateString(undefined, { month: 'short' })
  })
)

const studentSeries = computed(() => [
  { name: 'New students', data: (insights.value?.monthly ?? []).map(m => m.students), color: '#22c55e' }
])

const schoolSeries = computed(() => [
  { name: 'New schools', data: (insights.value?.monthly ?? []).map(m => m.schools), color: '#3b82f6' },
  { name: 'Demo requests', data: (insights.value?.monthly ?? []).map(m => m.demoRequests), color: '#f59e0b' }
])

const statusBar = computed(() => {
  const s = insights.value?.schools
  if (!s || !s.total) return []
  return [
    { label: 'Live', value: s.live, class: 'bg-success', dot: 'bg-success' },
    { label: 'Playground', value: s.playground, class: 'bg-warning', dot: 'bg-warning' },
    { label: 'Inactive', value: s.inactive, class: 'bg-neutral-400', dot: 'bg-neutral-400' }
  ]
})

const maxStudents = computed(() => Math.max(1, ...(insights.value?.topSchools ?? []).map(t => t.students)))

// Things that need someone to do something, most pressing first.
const tasks = computed(() => {
  const list: { id: string, icon: string, title: string, detail: string, to: string, tone: 'primary' | 'warning' }[] = []
  const unread = insights.value?.content.unreadMessages ?? 0
  if (unread) {
    list.push({
      id: 'messages', icon: 'i-lucide-inbox', tone: 'primary', to: '/contact-messages',
      title: `${unread} unread contact message${unread === 1 ? '' : 's'}`, detail: 'Sent from the marketing site'
    })
  }
  const leads = insights.value?.leads
  if (leads?.awaitingFollowUp) {
    list.push({
      id: 'leads', icon: 'i-lucide-bell-ring', tone: 'warning', to: '/leads',
      title: `${leads.awaitingFollowUp} lead${leads.awaitingFollowUp === 1 ? '' : 's'} awaiting follow-up`,
      detail: leads.overdue ? `${leads.overdue} overdue by more than a day` : 'Reach out and log it in the lead'
    })
  }
  if (leads?.unassigned) {
    list.push({
      id: 'unassigned', icon: 'i-lucide-user-x', tone: 'warning', to: '/leads',
      title: `${leads.unassigned} open lead${leads.unassigned === 1 ? ' has' : 's have'} nobody responsible`, detail: 'Give each one an owner'
    })
  }
  const support = insights.value?.support
  if (support?.urgent) {
    list.push({
      id: 'urgent-tickets', icon: 'i-lucide-siren', tone: 'warning', to: '/support',
      title: `${support.urgent} urgent support ticket${support.urgent === 1 ? '' : 's'}`, detail: 'A school is waiting for help'
    })
  }
  if (support?.unassigned) {
    list.push({
      id: 'unassigned-tickets', icon: 'i-lucide-user-x', tone: 'warning', to: '/support',
      title: `${support.unassigned} support ticket${support.unassigned === 1 ? ' has' : 's have'} nobody responsible`, detail: 'Give each one an owner'
    })
  }
  const fees = collections.value
  if (fees?.outstanding) {
    list.push({
      id: 'fees-owed', icon: 'i-lucide-hand-coins', tone: 'warning', to: '/fee-collection',
      title: `${fees.schoolsOwing} school${fees.schoolsOwing === 1 ? ' has' : 's have'} platform fees still to collect`,
      detail: `${money.format(fees.outstanding)} not yet paid by students`
    })
  }
  const onboarding = insights.value?.onboarding
  if (onboarding?.overdueSteps) {
    list.push({
      id: 'onboarding', icon: 'i-lucide-alarm-clock', tone: 'warning', to: '/onboarding',
      title: `${onboarding.overdueSteps} onboarding step${onboarding.overdueSteps === 1 ? ' is' : 's are'} overdue`, detail: 'Schools waiting to go live'
    })
  }
  for (const row of insights.value?.needsAttention ?? []) {
    list.push({
      id: row.id, icon: 'i-lucide-school', tone: 'warning', to: '/schools',
      title: row.name, detail: `${row.reason ?? ''}${row.createdAt ? ` · since ${formatDate(row.createdAt)}` : ''}`
    })
  }
  return list
})

const inbox = computed(() => {
  const c = insights.value?.content
  const d = insights.value?.demos
  // Only for an admin whose role covers marketing - nobody else gets these numbers at all.
  if (!c || !d) return []
  return [
    { label: 'Unread messages', value: c?.unreadMessages ?? 0, hint: 'Contact form', icon: 'i-lucide-inbox', to: '/contact-messages', color: 'primary' as const, urgent: (c?.unreadMessages ?? 0) > 0 },
    { label: 'Demo requests', value: d?.inPeriod ?? 0, hint: `In ${periodText.value} · ${d?.total ?? 0} in total`, icon: 'i-lucide-presentation', to: '/demo-requests', color: 'warning' as const, urgent: false },
    { label: 'Blog posts', value: c?.publishedPosts ?? 0, hint: `${c?.draftPosts ?? 0} draft${c?.draftPosts === 1 ? '' : 's'}`, icon: 'i-lucide-newspaper', to: '/blog', color: 'info' as const, urgent: false },
    { label: 'Testimonials', value: c?.publishedTestimonials ?? 0, hint: 'Published', icon: 'i-lucide-quote', to: '/testimonials', color: 'success' as const, urgent: false }
  ]
})

// "SYSTEM_ADMIN_LOGIN_SUCCESS" -> "System admin login success"
const humanize = (action: string) => {
  const text = action.toLowerCase().replace(/_/g, ' ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}
</script>

<template>
  <div class="px-4 md:px-6 space-y-3">
    <!-- Period -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-muted">Platform overview across every school on Skultem.</p>
      <USelect v-model="days" :items="periods" value-key="value" class="md:w-64" icon="i-lucide-calendar-range" />
    </div>

    <UAlert v-if="failed" color="error" variant="soft" icon="i-lucide-circle-alert" title="Some figures could not be loaded"
      description="The platform overview is incomplete.">
      <template #actions>
        <UButton size="xs" color="error" variant="outline" label="Try again" @click="load" />
      </template>
    </UAlert>

    <!-- Stats -->
    <div class="grid gap-3 grid-cols-2 xl:grid-cols-3">
      <Metric :record="{
        color: 'primary',
        icon: SCHOOL_ICON,
        label: 'Total schools',
        value: stats.totalSchools,
        subtle: trend(insights?.growth.schools).text,
        subtileColor: trend(insights?.growth.schools).color,
        isReady: !statsLoading,
      }" />
      <Metric :record="{
        color: 'success',
        icon: 'i-lucide-school',
        label: 'Active schools',
        value: (insights?.schools.live ?? 0) + (insights?.schools.playground ?? 0),
        subtle: insights ? `${insights.schools.live} live · ${insights.schools.playground} in playground · ${insights.schools.inactive} inactive` : '',
        isReady: !!insights || !insightsLoading,
      }" />
      <Metric :record="{
        color: 'info',
        icon: USERS_ICON,
        label: 'Platform users',
        value: stats.totalUsers,
        subtle: trend(insights?.growth.users).text,
        subtileColor: trend(insights?.growth.users).color,
        isReady: !statsLoading,
      }" />
      <Metric :record="{
        color: 'success',
        icon: STUDENT_ICON,
        label: 'Students',
        value: stats.totalStudents,
        subtle: trend(insights?.growth.students).text,
        subtileColor: trend(insights?.growth.students).color,
        isReady: !statsLoading,
      }" />
      <NuxtLink v-if="collections" to="/fee-collection" class="block">
        <Metric :record="{
          color: 'primary', icon: 'i-lucide-hand-coins', label: 'Platform fees collected',
          value: money.format(collections.collected),
          subtle: collections.outstanding ? `${money.format(collections.outstanding)} still to collect · ${collections.rate}% paid` : 'Everything billed has been paid',
          isReady: true,
        }" />
      </NuxtLink>
      <NuxtLink v-if="insights?.support" to="/support" class="block">
        <Metric :record="{
          color: insights.support.urgent ? 'error' : 'info', icon: 'i-lucide-life-buoy', label: 'Open support tickets',
          value: insights.support.open,
          subtle: insights.support.urgent ? `${insights.support.urgent} urgent · ${insights.support.unassigned} unassigned` : `${insights.support.unassigned} unassigned`,
          subtileColor: insights.support.urgent ? 'error' : 'neutral',
          isReady: true,
        }" />
      </NuxtLink>
      <NuxtLink v-if="insights?.leads" to="/leads" class="block">
        <Metric :record="{
          color: 'warning',
          icon: 'i-lucide-bell-ring',
          label: 'Leads awaiting follow-up',
          value: insights?.leads?.awaitingFollowUp ?? 0,
          subtle: insights ? `${insights.leads?.open} open · ${insights.leads?.unassigned} unassigned` : '',
          subtileColor: insights?.leads?.awaitingFollowUp ? 'warning' : 'neutral',
          isReady: !!insights || !insightsLoading,
        }" />
      </NuxtLink>
      <NuxtLink v-if="insights?.onboarding" to="/onboarding" class="block">
        <Metric :record="{
          color: 'primary',
          icon: 'i-lucide-list-checks',
          label: 'Pending school onboarding',
          value: insights?.onboarding?.inProgress ?? 0,
          subtle: insights ? (insights.onboarding?.overdueSteps ? `${insights.onboarding?.overdueSteps} overdue step${insights.onboarding?.overdueSteps === 1 ? '' : 's'}` : `${insights.onboarding?.completed} launched so far`) : '',
          subtileColor: insights?.onboarding?.overdueSteps ? 'error' : 'neutral',
          isReady: !!insights || !insightsLoading,
        }" />
      </NuxtLink>
      <Metric class="col-span-2 lg:col-span-1" v-if="insights?.demos" :record="{
        color: 'warning',
        icon: 'i-lucide-presentation',
        label: 'New demo requests',
        value: insights?.demos?.inPeriod ?? 0,
        subtle: trend(insights?.growth.demoRequests).text,
        subtileColor: trend(insights?.growth.demoRequests).color,
        isReady: !!insights || !insightsLoading,
      }" />
    </div>

    <!-- Pending tasks + inbox -->
    <div class="grid gap-4 lg:grid-cols-3">
      <UCard class="lg:col-span-2" :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-list-todo" class="size-5 text-warning" />
            <h3 class="font-semibold text-highlighted">Pending tasks</h3>
            <UBadge v-if="tasks.length" size="sm" color="warning" variant="subtle" :label="tasks.length" />
          </div>
        </template>

        <div v-if="insightsLoading && !insights" class="space-y-3 p-4">
          <USkeleton v-for="i in 3" :key="i" class="h-10 w-full" />
        </div>
        <div v-else-if="!tasks.length" class="flex flex-col items-center gap-1 py-10 text-center">
          <UIcon name="i-lucide-circle-check" class="size-8 text-success" />
          <p class="text-sm font-medium text-highlighted">Nothing needs attention</p>
          <p class="text-xs text-muted">No leads waiting, no overdue onboarding and no unread messages.</p>
        </div>
        <ul v-else class="divide-y divide-default">
          <li v-for="task in tasks" :key="task.id" class="flex items-center justify-between gap-3 px-4 py-3">
            <div class="flex min-w-0 items-center gap-3">
              <UBadge :icon="task.icon" :color="task.tone" variant="subtle" class="shrink-0 rounded-lg p-2" />
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-highlighted">{{ task.title }}</p>
                <p class="truncate text-xs text-muted">{{ task.detail }}</p>
              </div>
            </div>
            <UButton size="xs" variant="soft" color="neutral" label="Open" trailing-icon="i-lucide-arrow-right" :to="task.to" />
          </li>
        </ul>
      </UCard>

      <div v-if="inbox.length" class="grid grid-cols-2 gap-3 lg:grid-cols-1">
        <NuxtLink v-for="item in inbox" :key="item.label" :to="item.to"
          class="group flex items-center gap-3 rounded-xl border border-default bg-default p-3 transition hover:border-primary/60">
          <UBadge :icon="item.icon" :color="item.color" variant="subtle" size="xl" class="rounded-xl p-2.5" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs text-muted">{{ item.label }}</p>
            <p class="font-display text-xl font-semibold leading-tight text-highlighted">{{ item.value }}</p>
            <p class="truncate text-[11px] text-muted">{{ item.hint }}</p>
          </div>
          <span v-if="item.urgent" class="size-2 shrink-0 rounded-full bg-primary" aria-label="Needs a look" />
        </NuxtLink>
      </div>
    </div>

    <!-- Growth -->
    <div class="grid gap-4 lg:grid-cols-2">
      <UCard>
        <template #header>
          <div>
            <h3 class="font-semibold text-highlighted">New students</h3>
            <p class="text-xs text-muted">Enrolled each month, last 6 months</p>
          </div>
        </template>
        <SystemAdminMonthlyChart :labels="monthLabels" :series="studentSeries" />
      </UCard>

      <UCard>
        <template #header>
          <div>
            <h3 class="font-semibold text-highlighted">Schools &amp; demo requests</h3>
            <p class="text-xs text-muted">New each month, last 6 months</p>
          </div>
        </template>
        <SystemAdminMonthlyChart :labels="monthLabels" :series="schoolSeries" />
      </UCard>
    </div>

    <!-- Recent registrations + platform activity -->
    <div class="grid gap-4 lg:grid-cols-2">
      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h3 class="font-semibold text-highlighted">Recent school registrations</h3>
            <UButton label="All schools" size="xs" variant="ghost" trailing-icon="i-lucide-arrow-right" to="/schools" />
          </div>
        </template>
        <div v-if="insightsLoading && !insights" class="space-y-3 p-4">
          <USkeleton v-for="i in 4" :key="i" class="h-10 w-full" />
        </div>
        <p v-else-if="!insights?.recentSchools.length" class="py-8 text-center text-sm text-muted">No schools yet.</p>
        <ul v-else class="divide-y divide-default">
          <li v-for="row in insights.recentSchools" :key="row.id" class="flex items-center justify-between gap-3 px-4 py-3">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-highlighted">{{ row.name }}</p>
              <p class="truncate text-xs text-muted">{{ row.ownerName || 'No owner on record' }} · {{ row.domain }}</p>
            </div>
            <div class="flex shrink-0 flex-col items-end gap-1">
              <UBadge size="xs" variant="subtle" :color="row.status !== 'ACTIVE' ? 'neutral' : row.playground ? 'warning' : 'success'"
                :label="row.status !== 'ACTIVE' ? 'Inactive' : row.playground ? 'Playground' : 'Live'" />
              <span class="text-[11px] text-muted">{{ row.createdAt ? formatDate(row.createdAt) : '' }}</span>
            </div>
          </li>
        </ul>
      </UCard>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-activity" class="size-5 text-muted" />
            <h3 class="font-semibold text-highlighted">Recent platform activity</h3>
          </div>
        </template>
        <div v-if="insightsLoading && !insights" class="space-y-3 p-4">
          <USkeleton v-for="i in 5" :key="i" class="h-9 w-full" />
        </div>
        <p v-else-if="!insights?.recentActivity.length" class="py-8 text-center text-sm text-muted">Nothing recorded yet.</p>
        <ul v-else class="divide-y divide-default">
          <li v-for="a in insights.recentActivity" :key="a.id" class="flex items-start gap-3 px-4 py-2.5">
            <span class="mt-1.5 size-2 shrink-0 rounded-full" :class="a.status === 'FAILURE' ? 'bg-error' : a.status === 'REJECTED' ? 'bg-warning' : 'bg-success'"
              :title="a.status === 'FAILURE' ? 'Failed' : a.status === 'REJECTED' ? 'Rejected' : 'Succeeded'" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm text-highlighted">{{ humanize(a.action) }}</p>
              <p class="truncate text-xs text-muted">
                {{ [a.userName, a.schoolName].filter(Boolean).join(' · ') || 'Platform' }}
              </p>
            </div>
            <span class="shrink-0 text-[11px] text-muted">{{ a.createdAt ? formatDateTime(a.createdAt) : '' }}</span>
          </li>
        </ul>
      </UCard>
    </div>

    <!-- School mix + biggest schools -->
    <div class="grid gap-4 lg:grid-cols-2">
      <UCard>
        <template #header>
          <h3 class="font-semibold text-highlighted">Schools by status</h3>
        </template>
        <div v-if="!statusBar.length" class="py-6 text-center text-sm text-muted">No schools yet.</div>
        <div v-else class="space-y-4">
          <div class="flex h-3 overflow-hidden rounded-full bg-elevated">
            <div v-for="seg in statusBar.filter(x => x.value)" :key="seg.label" :class="seg.class"
              :style="{ width: `${(seg.value / (insights?.schools.total || 1)) * 100}%` }" :title="`${seg.label}: ${seg.value}`" />
          </div>
          <ul class="grid grid-cols-3 gap-3 text-sm">
            <li v-for="seg in statusBar" :key="seg.label">
              <p class="flex items-center gap-1.5 text-xs text-muted"><span class="size-2 rounded-full" :class="seg.dot" /> {{ seg.label }}</p>
              <p class="font-display text-xl font-semibold text-highlighted">{{ seg.value }}</p>
            </li>
          </ul>
          <p class="text-xs text-muted">
            Live schools are active and past setup. Playground schools are still being tried out.
          </p>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h3 class="font-semibold text-highlighted">Biggest schools</h3>
            <span class="text-xs text-muted">Active students</span>
          </div>
        </template>
        <p v-if="!insights?.topSchools.length" class="py-8 text-center text-sm text-muted">No schools yet.</p>
        <ul v-else class="divide-y divide-default">
          <li v-for="(row, i) in insights.topSchools" :key="row.id" class="space-y-1.5 px-4 py-3">
            <div class="flex items-center justify-between gap-3">
              <p class="truncate text-sm font-medium text-highlighted">
                <span class="mr-2 text-xs text-muted">{{ i + 1 }}</span>{{ row.name }}
                <UBadge v-if="row.playground" size="xs" variant="subtle" color="warning" label="Playground" class="ml-1" />
              </p>
              <span class="shrink-0 text-sm font-semibold text-highlighted">{{ row.students }}</span>
            </div>
            <div class="h-1.5 overflow-hidden rounded-full bg-elevated">
              <div class="h-full rounded-full bg-primary" :style="{ width: `${(row.students / maxStudents) * 100}%` }" />
            </div>
          </li>
        </ul>
      </UCard>
    </div>

    <!-- Recent demo requests -->
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-presentation" class="size-5 text-muted" />
            <h3 class="font-semibold text-highlighted">Recent demo requests</h3>
            <UBadge v-if="demoRequestsMeta.total" size="sm" variant="subtle" :label="demoRequestsMeta.total" />
          </div>
          <UButton label="View all" size="xs" variant="ghost" trailing-icon="i-lucide-arrow-right" to="/demo-requests" />
        </div>
      </template>

      <div v-if="demoRequestsLoading" class="space-y-3 p-4">
        <USkeleton v-for="i in 3" :key="i" class="h-10 w-full" />
      </div>

      <p v-else-if="!demoRequests.length" class="py-10 text-center text-sm text-muted">
        No demo requests yet.
      </p>

      <ul v-else class="divide-y divide-default">
        <li v-for="req in demoRequests" :key="req.id" class="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-highlighted">{{ req.school }}</p>
            <p class="truncate text-xs text-muted">{{ req.name }} · {{ req.email }} · {{ req.phone }}</p>
          </div>
          <div class="flex items-center gap-2">
            <UBadge size="xs" variant="subtle" color="info" :label="req.priority" />
            <span class="text-xs text-muted">{{ formatDateTime(req.createdAt) }}</span>
          </div>
        </li>
      </ul>
    </UCard>
  </div>
</template>
