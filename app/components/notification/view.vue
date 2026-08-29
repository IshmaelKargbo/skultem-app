<script lang="ts" setup>
const { record } = defineProps<{
    record: AppNotification | undefined
}>()
const emit = defineEmits(['close'])

const state = ref(false)

const EXCLUDED_META_KEYS = ['student_id']
const META_GROUPS: Record<string, string[]> = {
    'ASSESSMENT': ['student_name', 'subject', 'teacher', 'score', 'weight', 'weightedScore'],
    'ATTENDANCE': ['student_name', 'attendance_date', 'status']
};

// Flatten keys to use in sorting
const META_ORDER = Object.values(META_GROUPS).flat();

function formatMetaKey(key: string) {
    return key
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .trim()
        .split(/\s+/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
}

function isAttendanceStatus(key: string) {
    return record?.type === 'ATTENDANCE' && key === 'status'
}

function attendanceStatusColor(status: string) {
    if (status === 'Present') return 'success'
    if (status === 'Absent') return 'error'
    if (status === 'Late') return 'warning'
    if (status === 'Excused') return 'info'
    return 'neutral'
}

async function markAsRead(notification: AppNotification) {
    await useAppStore().markAsRead(notification.id)
    notification.read = true
}

function close() {
    state.value = false
    emit('close')
}

const filteredMeta = computed(() => {
    if (!record?.meta) return {};

    // Exclude unwanted keys
    const entries = Object.entries(record.meta)
        .filter(([key]) => !EXCLUDED_META_KEYS.includes(key));

    // Sort according to META_ORDER
    entries.sort((a, b) => {
        const indexA = META_ORDER.indexOf(a[0]);
        const indexB = META_ORDER.indexOf(b[0]);

        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
    });

    return Object.fromEntries(entries);
});

const typeColor = computed(() => notificationTypeColor(record?.type))
const typeIcon = computed(() => notificationTypeIcon(record?.type))

// Unread + priority together decide the accent strip: an unread urgent/high notification
// should read as visually different from a routine read-out one, matching the color coding
// already used for it in the list row.
const accentColor = computed(() => {
    if (!record) return 'neutral'
    if (!record.read && record.priority) return notificationPriorityColor(record.priority)
    return typeColor.value
})

watch(() => record, () => {
    state.value = record ? true : false
}, { immediate: true })
</script>

<template>
    <UCard v-if="state && record" class="h-full flex flex-col sticky top-0 z-10 overflow-hidden" :ui="{ root: 'p-0 gap-0', body: 'p-0 sm:p-0' }">
        <!-- Accent strip -->
        <div class="h-1 shrink-0" :class="`bg-${accentColor}`" />

        <!-- Header -->
        <div class="border-b border-default bg-default">
            <div class="flex items-start gap-3 p-4 sm:p-5">
           
                <!-- Header Content -->
                <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <h2 class="truncate text-base font-semibold leading-tight text-highlighted">
                                {{ record.title }}
                            </h2>

                            <div class="mt-2 flex flex-wrap items-center gap-1.5">
                                <UBadge :color="typeColor" variant="soft" size="md">
                                    {{ clean(record.type) }}
                                </UBadge>

                                <UBadge v-if="record.priority" :color="notificationPriorityColor(record.priority)"
                                    variant="outline" size="md">
                                    {{ clean(record.priority) }}
                                </UBadge>

                                <UBadge v-if="!record.read" color="neutral" variant="subtle" size="md">
                                    Unread
                                </UBadge>
                            </div>

                            <div class="mt-2 flex items-center gap-1.5 text-xs text-muted">
                                <UIcon name="i-lucide-clock-3" class="size-3.5" />

                                <span>
                                    {{ notificationTimeAgo(record.createdAt) }}
                                </span>

                                <span class="text-dimmed">&middot;</span>

                                <span>
                                    {{ formatDate(record.createdAt) }}
                                </span>
                            </div>
                        </div>

                        <!-- Close -->
                        <UButton icon="i-lucide-x" variant="ghost" color="neutral" size="sm" class="shrink-0 rounded-xl"
                            aria-label="Close notification" @click="close" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto">
            <div class="space-y-4 p-4 sm:p-5">

                <!-- Message -->
                <div class="rounded-2xl border p-4" :class="[`border-${typeColor}/10`, `bg-${typeColor}/[0.03]`]">
                    <div class="mb-3 flex items-center gap-2">
                        <div class="flex size-8 items-center justify-center rounded-xl" :class="`bg-${typeColor}/10`">
                            <UIcon name="i-lucide-message-square-text" class="size-4" :class="`text-${typeColor}`" />
                        </div>

                        <div>
                            <p class="text-sm font-semibold text-highlighted">
                                Message
                            </p>

                            <p class="text-[11px] text-muted">
                                Notification details
                            </p>
                        </div>
                    </div>

                    <p class="whitespace-pre-wrap text-sm leading-6 text-toned">
                        {{ record.message || 'No additional details provided.' }}
                    </p>
                </div>

                <!-- Metadata -->
                <div v-if="Object.keys(filteredMeta).length" class="overflow-hidden rounded-2xl border border-default">
                    <div class="flex items-center gap-2 border-b border-default bg-muted/30 px-4 py-3">
                        <div class="flex size-8 items-center justify-center rounded-xl bg-muted">
                            <UIcon name="i-lucide-list-details" class="size-4 text-muted" />
                        </div>

                        <div>
                            <p class="text-sm font-semibold text-highlighted">
                                Details
                            </p>

                            <p class="text-[11px] text-muted">
                                Additional information
                            </p>
                        </div>
                    </div>

                    <div class="divide-y divide-default">
                        <div v-for="(value, key) in filteredMeta" :key="key"
                            class="flex items-center justify-between gap-4 px-4 py-3.5">
                            <div class="flex min-w-0 items-center gap-2">
                                <UIcon name="i-lucide-chevron-right" class="size-3.5 shrink-0 text-muted" />

                                <span class="truncate text-xs font-medium text-muted">
                                    {{ formatMetaKey(key) }}
                                </span>
                            </div>

                            <UBadge v-if="isAttendanceStatus(key)" :color="attendanceStatusColor(value)" variant="soft"
                                size="sm" class="shrink-0">
                                {{ value || '—' }}
                            </UBadge>

                            <span v-else
                                class="max-w-[60%] break-words text-right text-sm font-medium text-highlighted">
                                {{ value || '—' }}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-default bg-default/95 p-4 backdrop-blur sm:p-5">
            <UButton v-if="!record.read" block color="primary" size="md" icon="i-lucide-check" class="rounded-xl"
                @click="markAsRead(record)">
                Mark as Read
            </UButton>

            <div v-else class="flex items-center justify-center gap-2">
                <UBadge color="success" variant="soft" size="md" icon="i-lucide-check-check">
                    Read
                </UBadge>
            </div>
        </div>
    </UCard>
</template>