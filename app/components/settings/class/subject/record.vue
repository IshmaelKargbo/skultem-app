<template>
    <div>
        <USkeleton v-if="isLoading" class="h-3 w-32" />
        <slot v-if="record" :value="record" />
        <slot name="empty-state"  />
    </div>
</template>

<script setup lang="ts">
const { id } = defineProps<{
    id: string
}>()
const store = useSubjectStore()
const record = ref<Subject | null>(null)
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