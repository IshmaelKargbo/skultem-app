<template>
    <div class="p-4 sm:p-6 lg:p-7 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <div ref="detailSection">
            <Heading class="md:flex hidden" title="Notification Center"
                subtitle="Stay updated with your latest notifications">
                <div class="flex gap-3">
                    <UBadge color="error" variant="outline" size="lg">{{ summary.unread }} Unread</UBadge>
                    <UBadge color="success" variant="outline" size="lg">{{ summary.read }} Read</UBadge>
                </div>
            </Heading>
        </div>
        <div class="md:hidden space-y-3">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-xl font-bold">
                        Notifications
                    </h1>

                    <p class="text-xs text-gray-500">
                        Stay updated with recent activity
                    </p>
                </div>

            </div>

            <div class="grid grid-cols-2 gap-2">
                <UCard>
                    <div class="text-center">
                        <p class="text-xs text-gray-500">
                            Unread
                        </p>

                        <p class="text-lg font-bold text-red-500">
                            {{ summary.unread }}
                        </p>
                    </div>
                </UCard>

                <UCard>
                    <div class="text-center">
                        <p class="text-xs text-gray-500">
                            Read
                        </p>

                        <p class="text-lg font-bold text-success">
                            {{ summary.read }}
                        </p>
                    </div>
                </UCard>
            </div>
            <USlideover v-model:open="mobileOpen" side="right" :ui="{
                content: 'bg-white dark:bg-gray-950'
            }">
                <template #content>
                    <div class="flex h-screen flex-col">

                        <div class="flex-1 overflow-y-auto">
                            <NotificationView v-if="selected" :record="selected" @close="close" />
                        </div>
                    </div>
                </template>
            </USlideover>
        </div>
        <div class="grid gap-5 md:grid-cols-2 grid-cols-1">
            <div>
                <UCard :ui="{
                    body: 'sm:p-0'
                }">
                    <template #header>
                        <div class="space-y-3">
                            <UInput v-model="search" icon="i-heroicons-magnifying-glass"
                                placeholder="Search notifications" />
                            <div class="flex flex-wrap gap-2">
                                <UButton v-for="item in filters" :key="item.value" size="xs"
                                    :variant="filter === item.value ? 'solid' : 'outline'"
                                    :color="filter === item.value ? item.color : 'neutral'"
                                    @click="filter = item.value">
                                    {{ item.label }}
                                </UButton>
                            </div>
                        </div>
                    </template>
                    <div>
                        <div v-if="isLoading" class="p-6 text-center text-gray-400">Loading notifications...</div>
                        <div v-else-if="filteredNotifications.length === 0" class="p-6 text-center text-gray-400">No
                            notifications found</div>

                        <div v-for="(notification, index) in filteredNotifications" :key="notification.id"
                            class="p-4 border-b border-gray-200 dark:hover:bg-gray-950 dark:border-gray-800 cursor-pointer hover:bg-gray-50 transition-colors"
                            :class="{
                                'border-l-4': true,
                                [stateBorderClass(notification)]: true,
                                'bg-blue-50 dark:bg-gray-950': selected?.id === notification.id,
                                'border-b-0': index + 1 === filteredNotifications.length
                            }" @click="open(notification)">
                            <div class="flex justify-between items-start gap-3">
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <p class="font-semibold truncate">{{ notification.title }}</p>
                                        <UBadge :color="typeColor(notification.type)" variant="soft" size="xs"
                                            class="shrink-0">
                                            {{ clean(notification.type) }}
                                        </UBadge>
                                    </div>
                                    <p class="text-sm text-gray-500 line-clamp-2">{{ notification.message }}</p>
                                    <div class="flex items-center gap-2 mt-2">
                                        <UBadge :color="stateColor(notification)" variant="soft" size="xs"
                                            class="shrink-0">
                                            {{ notification.read ? 'Read' : 'Unread' }}
                                        </UBadge>
                                        <UBadge v-if="notification.priority"
                                            :color="priorityColor(notification.priority)" variant="outline" size="xs"
                                            class="shrink-0">
                                            {{ clean(notification.priority) }}
                                        </UBadge>
                                        <p class="text-xs text-gray-400">{{ formatDate(notification.createdAt) }}</p>
                                    </div>
                                </div>
                                <UIcon :name="notification.read ? 'lucide:check-check' : 'lucide:bell-ring'"
                                    class="shrink-0" :class="notification.read ? 'text-success' : 'text-primary'" />
                            </div>
                        </div>
                    </div>
                    <template #footer>
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <Showing :meta="meta" />
                            <UPagination v-if="meta.total > meta.size" size="sm" v-model:page="page"
                                :page-size="meta.size" :items-per-page="meta.size" :total="meta.total" show-edges />
                        </div>
                    </template>
                </UCard>
            </div>
            <div class="hidden md:block">
                <UCard class="sticky top-0">
                    <NotificationView v-if="selected" @close="selected = undefined" :record="selected" />
                    <div v-else class="flex flex-col items-center h-70 justify-center">
                        <UIcon name="lucide:inbox" class="text-4xl mb-3" />
                        <p class="text-xs">Select a notification to view details</p>
                    </div>
                </UCard>
            </div>
        </div>


    </div>
</template>
<script setup lang="ts">
type NotificationFilter = 'ALL' | 'READ' | 'UNREAD'

const filters: { label: string; value: NotificationFilter; color: 'neutral' | 'success' | 'primary' }[] = [
    { label: 'All', value: 'ALL', color: 'neutral' },
    { label: 'Unread', value: 'UNREAD', color: 'primary' },
    { label: 'Read', value: 'READ', color: 'success' }
]

const selected = ref<AppNotification | undefined>()
const search = ref('')
const filter = ref<NotificationFilter>('ALL')
const isLoading = ref(false)
const detailSection = ref<HTMLElement | null>(null)

const route = useRoute()
const router = useRouter()
const store = useParentStore()

const { notifications, meta } = storeToRefs(store)

const summary = computed(() => ({
    read: notifications.value.filter(n => n.read).length,
    unread: notifications.value.filter(n => !n.read).length
}))
const mobileOpen = ref(false)

watch(selected, (val) => {
    if (import.meta.client && window.innerWidth < 768) {
        mobileOpen.value = !!val
    }
})

function close() {
    selected.value = undefined
    mobileOpen.value = false
}
const page = computed<number>({
    get: () => Number(route.query.page ?? 1),
    set: (val) => updateQuery({ page: val })
})

const size = computed<number>({
    get: () => Number(route.query.size ?? 5),
    set: (val) => updateQuery({ size: val })
})

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

const filteredNotifications = computed(() => {
    let list = notifications.value

    if (filter.value === 'READ') list = list.filter(n => n.read)
    if (filter.value === 'UNREAD') list = list.filter(n => !n.read)

    if (search.value) {
        const q = search.value.toLowerCase()
        list = list.filter(n => `${n.title} ${n.message}`.toLowerCase().includes(q))
    }

    return list
})

watch(() => page.value, () => {
    detailSection.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    router.replace({
        query: {
            page: page.value
        }
    })

    fetchNotifications()
}, { immediate: true })


async function open(payload: AppNotification) {
    if (!payload) return

    if (!payload.read) {
        await useAppStore().markAsRead(payload.id)
        payload.read = true
    }

    selected.value = payload

    if (import.meta.client && window.innerWidth < 768) {
        mobileOpen.value = true
        return
    }

    detailSection.value?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
    })
}

async function fetchNotifications() {
    isLoading.value = true
    try {
        await store.fetchAllNotifications(page.value, size.value)
    } finally {
        isLoading.value = false
    }
}

function priorityColor(priority?: string) {
    const map: Record<string, string> = { URGENT: 'error', HIGH: 'warning', NORMAL: 'info' }
    return map[priority ?? ''] ?? 'neutral'
}

function typeColor(type?: string) {
    const map: Record<string, string> = { ATTENDANCE: 'warning', BEHAVIOUR: 'error', ASSESSMENT: 'primary', FEE: 'success' }
    return map[type ?? ''] ?? 'neutral'
}

function stateColor(n: AppNotification) {
    return n.read ? 'success' : 'primary'
}

function stateBorderClass(n: AppNotification) {
    if (n.read) return 'border-l-success'
    if (n.priority === 'URGENT') return 'border-l-error'
    if (n.priority === 'HIGH') return 'border-l-warning'
    return 'border-l-primary'
}

onMounted(() => {
    useAppStore().setTitle('Notifications')
    document.title = 'Notifications | Skultem'
})

definePageMeta({ role: [Role.PARENT] })
</script>
