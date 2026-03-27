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

function markAsRead(notification: AppNotification) {
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
    <div v-if="state && record" class="w-96 shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
        <div class="p-6 space-y-5">
            <div class="flex justify-between items-start gap-3 border-b mb-3 border-gray-200 pb-2">
                <div class="flex-1 min-w-0">
                    <p class="text-lg font-semibold">{{ record.title }}</p>
                    <p class="text-sm text-gray-400 mt-0.5">{{ formatDate(record.createdAt) }}</p>
                </div>
                <UButton icon="i-heroicons-x-mark" @click="close" variant="ghost" size="sm" />
            </div>

            <p class="text-sm text-gray-600 leading-relaxed">{{ record.message }}</p>

            <!-- Meta Details -->
            <div v-if="record.meta" class="rounded-md border border-gray-100 divide-y divide-gray-100">
                <div v-for="(value, key) in filteredMeta" :key="key"
                    class="flex items-center justify-between px-4 py-2.5">
                    <span class="text-xs text-gray-400 capitalize">{{ formatMetaKey(key) }}</span>
                    <span class="text-xs font-medium text-gray-700">{{ value || '—' }}</span>
                </div>
            </div>

            <div>
                <UButton size="sm" v-if="!record.read" color="primary" variant="outline" icon="lucide:check"
                    @click="markAsRead(record)">
                    Mark as Read
                </UButton>
                <UBadge v-else color="success" variant="soft">Read</UBadge>
            </div>
        </div>
    </div>
</template>
