<template>
    <UCard :ui="{
        body: 'sm:p-0 p-0'
    }">
        <template #header>
            <div class="flex items-center justify-between">
                <div>
                    <p>Fee Schedule</p>
                    <p class="text-xs text-muted">Fees due for the current term</p>
                </div>
                <UBadge v-if="!loading && data.length" :label="`${data.length} fees`" variant="subtle" color="neutral"
                    size="sm" />
            </div>
        </template>
        <div>
            <!-- Loading -->
            <template v-if="loading">
                <div v-for="i in 4" :key="i"
                    class="flex items-center justify-between gap-3 border-b px-4 py-3 border-gray-200 last:border-0 dark:border-gray-800">
                    <div class="flex gap-3 items-center">
                        <USkeleton class="size-9 shrink-0 rounded-xl" />
                        <div class="space-y-1.5">
                            <USkeleton class="h-3.5 w-28 rounded-md" />
                            <USkeleton class="h-3 w-24 rounded-md" />
                        </div>
                    </div>
                    <div class="flex flex-col items-end space-y-1.5">
                        <USkeleton class="h-3.5 w-16 rounded-md" />
                        <USkeleton class="h-5 w-16 rounded-full" />
                    </div>
                </div>
            </template>

            <!-- Data -->
            <template v-else-if="data.length">
                <div v-for="(value, i) in data" :key="value.fee + i"
                    class="border-b px-4 py-3 border-gray-200 last:border-0 dark:border-gray-800">
                    <div class="flex items-center justify-between gap-3">
                        <div class="flex gap-3 min-w-0 items-center">
                            <div class="md:flex size-9 shrink-0 hidden items-center justify-center rounded-xl bg-primary/10">
                                <UIcon name="ph:wallet-light" class="size-4 text-primary" />
                            </div>
                            <div class="min-w-0 space-y-0.5">
                                <h3 class="truncate text-sm font-semibold">{{ value.fee }}</h3>
                                <div class="flex items-center space-x-1 text-xs text-muted">
                                    <p>{{ value.term }}</p>
                                    <p>·</p>
                                    <p>{{ formatDate(value.dueDate) }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-1 text-right shrink-0">
                            <p class="text-sm font-bold text-info">{{ format(value.amount) }}</p>
                            <div class="flex justify-end items-center gap-2">
                                <p v-if="value.outstanding" class="text-xs font-semibold text-error">
                                    {{ format(value.outstanding) }}
                                </p>
                                <UBadge size="sm" :label="value.status" variant="subtle"
                                    :color="parseFeeStatusColor[value.status]" :icon="parseFeeStatusIcon[value.status]" />
                            </div>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Empty -->
            <template v-else>
                <div class="flex flex-col items-center py-16">
                    <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
                        <UIcon name="ph:wallet-light" class="size-10 text-muted" />
                    </div>

                    <h3 class="mt-4 text-sm font-semibold">No fee records found</h3>

                    <p class="mt-1 text-sm text-muted">Fee records will appear here.</p>
                </div>
            </template>
        </div>
    </UCard>
</template>

<script lang="ts" setup>
const { student } = defineProps<{
    student: string
}>()
const studentStore = useStudentStore()
const { format } = useMoney()

const loading = ref(true)
const emit = defineEmits(['change'])

const data = ref<any[]>([])

async function fetchRecord() {
    if (!student) return
    loading.value = true
    data.value = []
    try {
        const res = await studentStore.getAllStudentFeesById(student)
        data.value = res?.records ?? []
    } finally {
        loading.value = false
    }
    emit('change', student)
}

watch(() => student, fetchRecord, { immediate: true })
</script>
