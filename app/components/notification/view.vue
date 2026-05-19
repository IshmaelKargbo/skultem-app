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
    return key.replace(/_/g, ' ')
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
    <div v-if="state && record" class="w-full">
        <div class="space-y-5">
            <div class="flex justify-between items-start gap-3 dark:border-gray-800 border-b mb-3 border-gray-200 pb-2">
                <div class="flex-1 min-w-0">
                    <p class="text-base font-semibold">{{ record.title }}</p>
                    <p class="text-sm text-gray-400 mt-0.5">{{ formatDate(record.createdAt) }}</p>
                </div>
                <UButton icon="i-heroicons-x-mark" @click="close" variant="ghost" size="sm" />
            </div>

            <p class="text-sm text-gray-600 leading-relaxed">{{ record.message }}</p>
            <div v-if="record.meta" class="rounded-xl dark:border-gray-800 border-2 border-gray-100 divide-y-2 divide-gray-100 dark:divide-gray-800">
                <div v-for="(value, key) in filteredMeta" :key="key"
                    class="flex items-center justify-between px-4 py-2.5">
                    <span class="text-xs text-muted capitalize">{{ formatMetaKey(key) }}</span>
                    <UBadge v-if="isAttendanceStatus(key)" :color="attendanceStatusColor(value)" variant="soft"
                        size="xs">
                        {{ value || '—' }}
                    </UBadge>
                    <span v-else class="text-xs font-medium">{{ value || '—' }}</span>
                </div>
            </div>

            <div>
                <UButton size="sm" v-if="!record.read" color="primary" variant="outline" icon="lucide:check"
                    @click="markAsRead(record)">
                    Mark as Read
                </UButton>
                <UBadge v-else color="success" variant="soft" icon="lucide:check-check">Read</UBadge>
            </div>
        </div>
    </div>
</template>
