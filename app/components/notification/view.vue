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

watch(() => record, () => {
    state.value = record ? true : false
}, { immediate: true })
</script>

<template>
    <div v-if="state && record" class="h-full flex flex-col">
        <!-- Header -->
        <div class="border-b border-default bg-default">
            <div class="flex items-start gap-3 p-4 sm:p-5">
                <!-- Notification Icon -->
                <div class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                    <UIcon name="i-lucide-bell" class="size-5 text-primary" />
                </div>

                <!-- Header Content -->
                <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <h2 class="truncate text-base font-semibold leading-tight text-highlighted">
                                {{ record.title }}
                            </h2>

                            <div class="mt-2 flex flex-wrap items-center gap-1.5">
                                <UBadge :color="notificationTypeColor(record.type)" variant="soft" size="md">
                                    {{ clean(record.type) }}
                                </UBadge>

                                <UBadge v-if="record.priority" :color="notificationPriorityColor(record.priority)"
                                    variant="outline" size="md">
                                    {{ clean(record.priority) }}
                                </UBadge>
                            </div>

                            <div class="mt-2 flex items-center gap-1.5 text-xs text-muted">
                                <UIcon name="i-lucide-clock-3" class="size-3.5" />

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
                <div class="rounded-2xl border border-primary/10 bg-primary/[0.03] p-4">
                    <div class="mb-3 flex items-center gap-2">
                        <div class="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                            <UIcon name="i-lucide-message-square-text" class="size-4 text-primary" />
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
    </div>
</template>