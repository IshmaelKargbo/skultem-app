<template>
    <div>
        <USkeleton v-if="isLoading" class="h-3 w-32" />
        <slot v-else-if="record" :value="record" />
        <slot v-else name="empty-state" />
    </div>
</template>

<script setup lang="ts">
const { studentId, feeId } = defineProps<{
    studentId: string,
    feeId: string
}>()
const store = useStudentStore()
const record = ref<number | null>(null)
const isLoading = ref(false)

watch(
    () => studentId,
    async () => {
        try {
            if (!studentId) {
                record.value = null
                isLoading.value = false
                return
            }

            isLoading.value = true
            record.value = await store.sumFeesPaidByStudentAndFee(studentId, feeId);
            isLoading.value = false
        } catch (error) {
            isLoading.value = false
        }
    },
    {
        immediate: true
    }
)
</script>