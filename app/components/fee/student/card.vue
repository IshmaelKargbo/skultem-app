<template>
    <div class="p-4 border-2 border-gray-100 dark:border-gray-800 rounded-2xl transition-all duration-200 hover:border-primary-300 dark:hover:border-primary-700"
        :class="{
            'bg-primary-50 dark:bg-primary-950 border-primary-400 dark:border-primary-700': active,
            'bg-white dark:bg-gray-900': !active
        }">
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-3 ">
                <UAvatar size="md" :src="student.photo || '/avatar-placeholder.svg'"
                    :alt="`${student.givenNames} ${student.familyName}`"
                    class="ring-1 ring-gray-200 dark:ring-gray-700 shrink-0" />
                <div class="min-w-0">
                    <p class="font-semibold truncate">
                        {{ student.givenNames }} {{ student.familyName }}
                    </p>
                    <p class="text-[11px] text-muted truncate">{{ student.admissionNumber || 'No Admission No' }}</p>
                </div>
            </div>
            <div>
                <StudentEnrollment class="mb-1" :id="student.id">
                    <template #default="{ value }">
                        <p class="text-xs">
                            {{ parseClass(value) }}
                        </p>
                    </template>
                </StudentEnrollment>
                <UBadge :color="outstanding == 0 ? 'success' : 'error'" variant="outline"
                    :label="format(outstanding)" />
            </div>

        </div>

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

async function fetchData() {
    if (!student?.id) return

    outstanding.value = 0

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
