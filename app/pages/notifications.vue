<template>
    <div class="space-y-4 p-4 sm:space-y-5 sm:p-6 lg:p-7">
        <div ref="detailSection">
            <Heading title="Notification Center" subtitle="Stay updated with your latest notifications">
                <div class="flex flex-1 gap-3">
                    <UBadge color="error" variant="outline" size="lg">{{ summary.unread }} Unread</UBadge>
                    <UBadge color="success" variant="outline" size="lg">{{ summary.read }} Read</UBadge>
                </div>
            </Heading>
        </div>
        <USlideover v-model:open="mobileOpen" side="right" :ui="{
            content: 'bg-default'
        }">
            <template #content>
                <div class="flex h-screen flex-col">
                    <div class="flex-1 overflow-y-auto">
                        <NotificationView v-if="selected" :record="selected" @close="close" />
                    </div>
                </div>
            </template>
        </USlideover>
        <div class="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
            <div class="min-h-0">
                <UCard :ui="{ body: 'sm:p-0' }">
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
                        <!-- Loading -->
                        <template v-if="isLoading">
                            <div v-for="i in 5" :key="i"
                                class="flex items-start gap-3 border-b border-default p-4 last:border-b-0">
                                <USkeleton class="size-9 shrink-0 rounded-xl" />
                                <div class="flex-1 space-y-2">
                                    <USkeleton class="h-3.5 w-2/5 rounded-md" />
                                    <USkeleton class="h-3 w-full rounded-md" />
                                    <USkeleton class="h-3 w-16 rounded-md" />
                                </div>
                            </div>
                        </template>

                        <!-- Empty -->
                        <div v-else-if="filteredNotifications.length === 0"
                            class="flex flex-col items-center gap-2 py-14">
                            <UIcon name="lucide:bell-off" class="text-4xl text-muted" />
                            <p class="text-sm text-muted">No notifications found</p>
                        </div>

                        <!-- Data -->
                        <div v-for="(notification, index) in filteredNotifications" :key="notification.id"
                            class="cursor-pointer border-b border-default p-4 transition-colors hover:bg-muted/50"
                            :class="{
                                'border-l-4': true,
                                [stateBorderClass(notification)]: true,
                                'bg-primary-100 dark:bg-primary-500/20': selected?.id === notification.id,
                                'border-b-0': index + 1 === filteredNotifications.length
                            }" @click="open(notification)">
                            <div class="flex items-start gap-3">
                                <div class="relative shrink-0">
                                    <UBadge :icon="notificationTypeIcon(notification.type)" variant="subtle" size="lg"
                                        class="rounded-xl p-2" :color="notificationTypeColor(notification.type)" />
                                    <span v-if="!notification.read"
                                        class="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-primary ring-2 ring-default" />
                                </div>

                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <p class="truncate"
                                            :class="notification.read ? 'font-medium text-toned' : 'font-semibold text-highlighted'">
                                            {{ notification.title }}
                                        </p>
                                        <UBadge :color="notificationTypeColor(notification.type)" variant="soft"
                                            size="xs" class="shrink-0">
                                            {{ clean(notification.type) }}
                                        </UBadge>
                                    </div>
                                    <p class="text-sm text-muted line-clamp-2">{{ notification.message }}</p>
                                    <div class="mt-2 flex items-center gap-2">
                                        <UBadge v-if="notification.priority"
                                            :color="notificationPriorityColor(notification.priority)" variant="outline"
                                            size="xs" class="shrink-0">
                                            {{ clean(notification.priority) }}
                                        </UBadge>
                                        <p class="text-xs text-muted">{{ formatDate(notification.createdAt) }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <template #footer>
                        <div class="flex flex-col gap-3 sm:items-center sm:justify-between">
                            <Showing :meta="meta" />
                            <UPagination v-if="meta.total > meta.size" v-model:page="page" size="sm"
                                :page-size="meta.size" :items-per-page="meta.size" :total="meta.total" show-edges />
                        </div>
                    </template>
                </UCard>
            </div>
            <div class="hidden min-h-0 md:block">
                <UCard class="sticky top-0">
                    <NotificationView v-if="selected" @close="selected = undefined" :record="selected" />
                    <div v-else class="flex h-72 flex-col items-center justify-center">
                        <UIcon name="lucide:inbox" class="mb-3 text-4xl text-muted" />
                        <p class="text-xs text-muted">Select a notification to view details</p>
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
