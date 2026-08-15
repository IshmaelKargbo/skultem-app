<template>
    <UCard :ui="{
        body: 'p-0'
    }">
        <template #header>
            <div class="flex items-center justify-between">
                <p>Fee Schedule</p>
                <UBadge v-if="!loading && data.length" :label="`${data.length} fees`" variant="subtle" color="neutral"
                    size="sm" />
            </div>
        </template>
        <div>
            <!-- Loading -->
            <template v-if="loading">
                <div v-for="i in 4" :key="i" class="flex justify-between py-2 px-3" :class="{
                    'border-b border-gray-100 dark:border-gray-800': i < 4
                }">
                    <div class="space-y-1.5">
                        <USkeleton class="h-3.5 w-28 rounded-md" />
                        <USkeleton class="h-3 w-20 rounded-md" />
                    </div>
                    <div class="flex flex-col items-end space-y-1.5">
                        <USkeleton class="h-3.5 w-16 rounded-md" />
                        <USkeleton class="h-5 w-16 rounded-full" />
                    </div>
                </div>
            </template>

            <!-- Data -->
            <template v-else-if="data.length">
                <div v-for="(value, i) in data" :key="value.feeName + i" class="flex justify-between py-2 px-3" :class="{
                    'border-b border-gray-100 dark:border-gray-800': (i + 1) < data.length
                }">
                    <div class="space-y-0.5">
                        <p>{{ value.feeName }}</p>
                        <div class="flex text-xs space-x-1 text-mute">
                            <p>{{ value.term }}</p>
                            <p>·</p>
                            <p>{{ formatDate(value.dueDate) }}</p>
                        </div>
                    </div>
                    <div class="flex flex-col items-end space-y-0.5">
                        <p class="text-info font-medium">{{ format(value.total) }}</p>
                        <div class="flex space-x-2">
                            <p class="text-error font-semibold" v-if="value.outstanding">{{ format(value.outstanding) }}</p>
                            <UBadge size="sm" :label="value.status" variant="outline"
                                :color="parseFeeStatusColor[value.status]" :icon="parseFeeStatusIcon[value.status]" />
                        </div>
                    </div>
                </div>
            </template>

            <!-- Empty -->
            <template v-else>
                <div class="flex flex-col items-center gap-2 py-10">
                    <UIcon name="ph:wallet-light" class="text-4xl text-gray-400" />
                    <p class="text-gray-500">No fee records found.</p>
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
