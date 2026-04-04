<template>
    <UCard :ui="{
        body: 'p-0'
    }">
        <template #header>
            <div>
                <p>Fee Schedule</p>
            </div>
        </template>
        <div>
            <div v-for="(value, i) in data" class="flex justify-between py-2 px-3" :class="{
                'border-b border-gray-100': (i + 1) < data.length
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
                        <p class="text-error font-semibold" v-if="value.outstanding">{{ format(value.outstanding )}}</p>
                        <UBadge size="sm" :label="value.status" variant="outline"
                            :color="parseFeeStatusColor[value.status]" />
                    </div>
                </div>
            </div>
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

const data = ref<any>([])

async function fetchRecord() {
    if (student == "" || student == null) return
    loading.value = true
    data.value = []
    const res = await studentStore.getAllStudentFeesById(student)
    if (res == null) return

    data.value = res.records
    loading.value = false
}

watch(() => student, () => {
    fetchRecord()
    emit('change', student)
})

onMounted(() => fetchRecord())
</script>