<template>
    <div>
        <USkeleton v-if="isLoading" class="h-3 w-32" />
        <slot v-if="record" :value="record" />
    </div>
</template>

<script setup lang="ts">
const { id } = defineProps<{
    id: string
}>()
const store = useAcademicYearStore()
const record = ref<AcademicYear | null>(null)
const isLoading = ref(false)

watch(
    () => id,
    async () => {
        isLoading.value = true
        record.value = await store.findOne(id);
        isLoading.value = false
    },
    {
        immediate: true
    }
)
</script>