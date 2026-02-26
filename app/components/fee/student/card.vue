<template>
    <UCard @click="click" :class="['hover:bg-app-50/50 cursor-pointer hover:ring-app-100', active ? 'bg-app-50/50 ring-app-100' : '']">
        <div class="flex justify-between items-center">
            <p class="text-base">
                {{ student.givenNames }} {{ student.familyName }}
            </p>
            <UBadge :color="outstanding == 0 ? 'success' : 'error'" variant="subtle" :label="format(outstanding)" />
        </div>
        <StudentEnrollment :id="student.id">
            <template #default="{ value }">
                <p class="text-xs text-mute">
                    {{ parseClass(value) }}
                </p>
            </template>
        </StudentEnrollment>
    </UCard>
</template>

<script setup lang="ts">
const { student } = defineProps<{
    student: Student,
    active?: boolean
}>()
const store = useStudentStore()
const { format } = useMoney()
const outstanding = ref(0)
const emit = defineEmits(['click'])
const records = ref<StudentFee[]>([])

function click() {
    emit('click', student)
}

async function fetchData() {
    if (!student?.id) return

    records.value = []

    const res = await store.getAllStudentFeesById(
        student.id
    )

    if (res) {
        (res.records as StudentFee[]).map((e) => {
            outstanding.value += e.outstanding
        })
    }
}

watch(() => student.id, () => fetchData(), { immediate: true })
</script>
