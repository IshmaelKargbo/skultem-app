<script setup lang="ts">
type ActivityType =
  | 'STUDENT'
  | 'TEACHER'
  | 'PARENT'
  | 'USER'
  | 'CLASS'
  | 'SUBJECT'
  | 'GRADE'
  | 'FEES'
  | 'PAYMENT'
  | 'SCHOOL'
  | 'SETTINGS'

type ActivityItem = {
  id: string
  type: ActivityType
  title: string
  subject: string
  meta?: string | null
  referenceId?: string | null
  createdAt: string
}

const dashboard = useDashboardStore()

const activities = ref<ActivityItem[]>([])

const typeColor: Record<ActivityType, string> = {
  STUDENT: 'bg-green-500',
  TEACHER: 'bg-purple-500',
  PARENT: 'bg-indigo-500',
  USER: 'bg-slate-500',
  CLASS: 'bg-cyan-500',
  SUBJECT: 'bg-teal-500',
  GRADE: 'bg-emerald-500',
  FEES: 'bg-blue-500',
  PAYMENT: 'bg-blue-500',
  SCHOOL: 'bg-orange-500',
  SETTINGS: 'bg-amber-500',
}

const timeAgo = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const sec = Math.floor(diffMs / 1000)
  const min = Math.floor(sec / 60)
  const hr = Math.floor(min / 60)
  const day = Math.floor(hr / 24)

  if (day >= 1) return `${day} day${day === 1 ? '' : 's'} ago`
  if (hr >= 1) return `${hr} hour${hr === 1 ? '' : 's'} ago`
  if (min >= 1) return `${min} minute${min === 1 ? '' : 's'} ago`
  return 'just now'
}

onMounted(async () => {
  const res = await dashboard.fetchAdminActivities(4)
  activities.value = Array.isArray(res) ? res : []
})
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="text-sm font-semibold">Recent Activity</h3>
    </template>

    <div class="space-y-0">
      <div v-if="dashboard.loading" class="py-4 text-sm text-muted">Loading…</div>
      <div v-else-if="dashboard.error" class="py-4 text-sm text-red-600">{{ dashboard.error }}</div>
      <div v-else-if="activities.length === 0" class="py-4 text-sm text-muted">No activity yet.</div>
      <div 
        v-for="(item, index) in activities"
        :key="item.id" 
        class="flex gap-4 py-2.5 first:pt-0 last:pb-0 border-b border-gray-100 last:border-0"
      >
        <div class="mt-1.5 shrink-0">
          <div :class="[typeColor[item.type] || 'bg-slate-500', 'h-3 w-3 rounded-full']"></div>
        </div>

        <div class="flex flex-col">
          <span class="font-semibold text-sm leading-tight">
            {{ item.title }}
          </span>
          <span class="text-xs text-muted mt-0.5">
            {{ item.subject }}
          </span>
          <span class="text-xs text-mute mt-1">
            {{ timeAgo(item.createdAt) }}
          </span>
        </div>
      </div>
    </div>
  </UCard>
</template>
