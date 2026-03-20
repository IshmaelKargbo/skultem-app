<template>
    <div class="flex flex-col bg-gray-50 overflow-hidden" style="height: calc(100vh - 64px)">

        <!-- HEADER -->
        <div class="shrink-0 p-6 border-b border-gray-300 space-y-4">
            <div class="flex justify-between items-center">
                <div class="space-y-0.5">
                    <p class="text-xl font-semibold">Notification Center</p>
                    <p class="text-sm text-gray-500">Stay updated with your latest notifications.</p>
                </div>
                <div class="flex gap-3">
                    <UBadge color="error" variant="outline" size="lg">{{ summary.unread }} Unread</UBadge>
                    <UBadge color="success" variant="outline" size="lg">{{ summary.read }} Read</UBadge>
                </div>
            </div>

            <div class="flex justify-between items-center">
                <div class="flex gap-2">
                    <UButton size="sm" :variant="filter === 'ALL' ? 'outline' : 'ghost'" @click="filter = 'ALL'">All {{
                        notifications.length }}</UButton>
                    <UButton size="sm" :variant="filter === 'READ' ? 'outline' : 'ghost'" @click="filter = 'READ'">Read
                        {{ summary.read }}</UButton>
                    <UButton size="sm" :variant="filter === 'UNREAD' ? 'outline' : 'ghost'" @click="filter = 'UNREAD'">
                        Unread {{ summary.unread }}</UButton>
                </div>
                <div class="w-1/3">
                    <UInput v-model="search" icon="i-heroicons-magnifying-glass" placeholder="Search notifications" />
                </div>
            </div>
        </div>

        <!-- BODY — this row fills remaining height, no overflow -->
        <div class="flex flex-1 min-h-0">

            <!-- LEFT LIST — scrolls independently -->
            <div class="flex-1 bg-white overflow-y-auto">
                <div v-if="isLoading" class="p-6 text-center text-gray-400">Loading notifications...</div>
                <div v-else-if="filteredNotifications.length === 0" class="p-6 text-center text-gray-400">No
                    notifications found</div>

                <div v-for="(notification, index) in filteredNotifications" :key="notification.id"
                    class="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors" :class="{
                        'bg-blue-50 border-l-2 border-l-primary': selected?.id === notification.id,
                        'border-b-0': index + 1 === filteredNotifications.length
                    }" @click="selected = notification">
                    <div class="flex justify-between items-start gap-3">
                        <div class="flex-1 min-w-0">
                            <p class="font-semibold truncate">{{ notification.title }}</p>
                            <p class="text-sm text-gray-500 line-clamp-2">{{ notification.message }}</p>
                            <p class="text-xs text-gray-400 mt-1">{{ formatDate(notification.createdAt) }}</p>
                        </div>
                        <UBadge v-if="!notification.read" color="primary" variant="soft" size="xs" class="shrink-0">New
                        </UBadge>
                    </div>
                </div>
            </div>

            <!-- RIGHT DETAIL — scrolls independently -->
            <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-x-4"
                enter-to-class="opacity-100 translate-x-0" leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 translate-x-0" leave-to-class="opacity-0 translate-x-4">
                <div v-if="selected" class="w-96 shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
                    <div class="p-6">
                        <div class="flex justify-between items-start gap-3">
                            <div class="flex-1 min-w-0">
                                <p class="text-lg font-semibold">{{ selected.title }}</p>
                                <p class="text-sm text-gray-400 mt-0.5">{{ formatDate(selected.createdAt) }}</p>
                            </div>
                            <UButton icon="i-heroicons-x-mark" variant="ghost" size="sm" @click="selected = null" />
                        </div>

                        <UDivider class="my-4" />

                        <p class="text-sm text-gray-600 leading-relaxed">{{ selected.message }}</p>

                        <div class="mt-6">
                            <UButton v-if="!selected.read" color="primary" icon="lucide:check"
                                @click="markAsRead(selected)">
                                Mark as Read
                            </UButton>
                            <UBadge v-else color="success" variant="soft">Read</UBadge>
                        </div>
                    </div>
                </div>
            </Transition>

        </div>

    </div>
</template>
<script setup lang="ts">
type NotificationFilter = 'ALL' | 'READ' | 'UNREAD'

const selected = ref<AppNotification | null>(null)
const route = useRoute()
const router = useRouter()
const search = ref('')
const filter = ref<NotificationFilter>('ALL')
const store = useParentStore()
const { notifications } = storeToRefs(store)
const scrollContainer = inject<Ref<HTMLElement | null>>('scrollContainer')

const isLoading = ref(false)

const summary = computed(() => ({
    read: notifications.value.filter(n => n.read).length,
    unread: notifications.value.filter(n => !n.read).length
}))

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery }

  if (
    merged.page === route.query.page &&
    merged.size === route.query.size
  ) {
    return
  }

  router.replace({ query: merged })
}

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val })
})

watch(() => page.value, () => {
  nextTick(() => {
    scrollContainer?.value?.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  })
  router.replace({
    query: {
      page: page.value,
      size: size.value
    }
  })

  fetchNotifications()
}, { immediate: true })

const filteredNotifications = computed(() => {

    let list = notifications.value

    if (filter.value === 'READ') {
        list = list.filter(n => n.read)
    }

    if (filter.value === 'UNREAD') {
        list = list.filter(n => !n.read)
    }

    if (search.value) {

        const q = search.value.toLowerCase()

        list = list.filter(n =>
            `${n.title} ${n.message}`.toLowerCase().includes(q)
        )

    }

    return list

})

async function fetchNotifications() {

    isLoading.value = true

    try {
        await store.fetchAllNotifications(page.value, size.value)
    } finally {
        isLoading.value = false
    }

}

function markAsRead(notification: AppNotification) {
    notification.read = true
}

function formatDate(date: string) {
    return new Date(date).toLocaleString()
}

onMounted(() => {

    useAppStore().setTitle('Notifications')
    document.title = 'Notifications | Skultem'

    fetchNotifications()

})

definePageMeta({
    role: [Role.PARENT]
})

</script>