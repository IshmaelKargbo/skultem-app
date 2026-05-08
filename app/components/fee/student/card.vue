<template>
    <div class="p-4 border-2 border-gray-200 rounded-2xl" :class="{
        'bg-primary-700 text-white': active
    }">
        <div class="flex justify-between items-center">
            <p class="font-semibold">
                {{ student.givenNames }} {{ student.familyName }}
            </p>
            <UBadge :color="outstanding == 0 ? 'success' : 'error'" variant="outline" :label="format(outstanding)" />
        </div>
        <StudentEnrollment :id="student.id">
            <template #default="{ value }">
                <p class="text-xs">
                    {{ parseClass(value) }}
                </p>
            </template>
        </StudentEnrollment>
    </div>
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
