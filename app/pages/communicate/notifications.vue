<script setup lang="ts">
type NotificationFilter = 'ALL' | 'READ' | 'UNREAD'

const filterOptions = [
  { label: 'All', value: 'ALL' },
  { label: 'Unread', value: 'UNREAD' },
  { label: 'Read', value: 'READ' }
]

const route = useRoute()
const router = useRouter()
const store = useNotificationStore()
const { records: notifications, loading, meta } = storeToRefs(store)

const search = ref('')
const filter = ref<NotificationFilter>('ALL')
const selected = ref<AppNotification>()

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => router.replace({ query: { ...route.query, page: val } })
})

const size = ref(runtimeConf().limit)

watch([page, size], () => store.fetchAll(page.value, size.value), { immediate: true })

onMounted(() => {
  if (!route.query.page) router.replace({ query: { ...route.query, page: page.value } })
  useAppStore().setTitle('Notifications')
  document.title = 'Notifications | Skultem'
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PARENT, Role.ACCOUNTANT]
})

const summary = computed(() => ({
  unread: notifications.value.filter(n => !n.read).length,
  read: notifications.value.filter(n => n.read).length
}))

const data = computed(() => {
  const q = search.value.trim().toLowerCase()

  return notifications.value.filter(n => {
    const matchesSearch = !q || `${n.title} ${n.message}`.toLowerCase().includes(q)
    const matchesFilter = filter.value === 'ALL' || (filter.value === 'READ' ? n.read : !n.read)
    return matchesSearch && matchesFilter
  })
})

function borderClass(n: AppNotification) {
  if (!n.read) return 'border-l-primary'
  if (n.priority === 'URGENT') return 'border-l-error'
  if (n.priority === 'HIGH') return 'border-l-warning'
  return 'border-l-default'
}

async function open(notification: AppNotification) {
  if (!notification.read) await store.markAsRead(notification.id)
  selected.value = notification
}

function close() {
  selected.value = undefined
}
</script>

<template>
  <div class="px-4 md:px-6 space-y-4">
    <UCard>
      <template #header>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <UInput v-model="search" :icon="SEARCH_ICON" placeholder="Search notifications..." class="w-full sm:w-72" />
            <USelectMenu v-model="filter" value-key="value" :items="filterOptions" class="w-full sm:w-40" />
          </div>

          <div class="flex items-center gap-2">
            <UBadge color="primary" variant="subtle" size="sm">{{ summary.unread }} Unread</UBadge>
            <UBadge color="neutral" variant="subtle" size="sm">{{ summary.read }} Read</UBadge>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <div v-if="loading && !data.length" class="space-y-3">
          <UCard v-for="i in 3" :key="i" :ui="{ body: 'p-4' }">
            <div class="flex items-start gap-3">
              <USkeleton class="size-10 shrink-0 rounded-xl" />
              <div class="min-w-0 flex-1 space-y-2">
                <USkeleton class="h-4 w-1/3" />
                <USkeleton class="h-3 w-full" />
                <USkeleton class="h-3 w-2/3" />
              </div>
            </div>
          </UCard>
        </div>

        <div v-else-if="!data.length" class="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-default py-16">
          <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
            <UIcon :name="BELL_ICON" class="text-3xl text-primary-500" />
          </div>
          <h3 class="font-semibold text-highlighted">No notifications found</h3>
          <p class="text-sm text-muted">Updates and alerts sent to you will appear here.</p>
        </div>

        <div v-else class="space-y-3">
          <UCard
            v-for="notification in data"
            :key="notification.id"
            :ui="{ body: 'p-4' }"
            class="cursor-pointer border-l-4 transition-colors hover:border-primary/40"
            :class="borderClass(notification)"
            @click="open(notification)"
          >
            <div class="flex items-start gap-3">
              <div class="relative shrink-0">
                <div class="flex size-10 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
                  <UIcon :name="notificationTypeIcon(notification.type)" class="text-primary-500" />
                </div>
                <span v-if="!notification.read" class="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-primary ring-2 ring-default" />
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="truncate font-semibold text-highlighted">{{ notification.title }}</h3>
                  <UBadge :color="notificationTypeColor(notification.type)" variant="subtle" size="sm">
                    {{ clean(notification.type) }}
                  </UBadge>
                  <UBadge v-if="notification.priority" :color="notificationPriorityColor(notification.priority)" variant="outline" size="sm">
                    {{ clean(notification.priority) }}
                  </UBadge>
                </div>

                <p class="mt-2 line-clamp-2 text-sm text-muted">{{ notification.message }}</p>
                <p class="mt-3 text-xs text-muted">{{ formatDate(notification.createdAt) }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <template v-if="meta.total" #footer>
        <div class="flex items-center justify-between">
          <Showing :meta="meta" />
          <UPagination v-model:page="page" size="sm" :page-size="meta.size" :items-per-page="meta.size" :total="meta.total" show-edges />
        </div>
      </template>
    </UCard>

    <USlideover :open="!!selected" side="right" :ui="{ content: 'bg-default' }" @update:open="close">
      <template #content>
        <NotificationView v-if="selected" :record="selected" @close="close" />
      </template>
    </USlideover>
  </div>
</template>
