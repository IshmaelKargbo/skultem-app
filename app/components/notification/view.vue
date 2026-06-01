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
    <div v-if="state && record" class="h-full flex flex-col">
        <!-- Header -->
        <div class="sticky top-0 z-10 bg-default border-b border-default px-4 py-4">
            <div class="flex items-start gap-3">
                <div class="flex-1 min-w-10">
                    <h2 class="font-semibold text-base leading-tight">
                        {{ record.title }}
                    </h2>

                    <div class="mt-1">
                        <span class="text-xs text-muted">
                            {{ formatDate(record.createdAt) }}
                        </span>
                    </div>
                </div>

              <div>
                  <UButton icon="i-heroicons-x-mark" variant="ghost" color="neutral" size="md" square @click="close" />
              </div>
            </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4 space-y-5">
            <!-- Message -->
            <UCard>
                <template #header>
                    <div class="font-medium">Message</div>
                </template>

                <p class="text-sm leading-6 text-toned whitespace-pre-wrap">
                    {{ record.message }}
                </p>
            </UCard>

            <!-- Metadata -->
            <UCard v-if="Object.keys(filteredMeta).length">
                <template #header>
                    <div class="font-medium">Details</div>
                </template>

                <div class="space-y-3">
                    <div v-for="(value, key) in filteredMeta" :key="key" class="flex items-start justify-between gap-4">
                        <span class="text-xs uppercase tracking-wide text-muted shrink-0">
                            {{ formatMetaKey(key) }}
                        </span>

                        <UBadge v-if="isAttendanceStatus(key)" :color="attendanceStatusColor(value)" variant="soft"
                            size="sm">
                            {{ value || '—' }}
                        </UBadge>

                        <span v-else class="text-sm text-right font-medium break-words">
                            {{ value || '—' }}
                        </span>
                    </div>
                </div>
            </UCard>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 border-t border-default bg-default p-4">
            <UButton v-if="!record.read" block color="primary" icon="lucide:check" @click="markAsRead(record)">
                Mark as Read
            </UButton>

            <div v-else class="flex justify-center">
                <UBadge color="success" variant="soft" size="lg" icon="lucide:check-check">
                    Read
                </UBadge>
            </div>
        </div>
    </div>
</template>