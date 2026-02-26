<template>
    <div>
        <USkeleton v-if="isLoading" class="h-3 w-32" />
        <slot :value="records" />
        <slot name="empty-state"  />
    </div>
</template>

<script setup lang="ts">
const { id } = defineProps<{
    id: string
}>()
const store = useTeacherStore()
const records = ref<TeacherSubject[] | null>(null)
const isLoading = ref(false)

watch(
    () => id,
    async () => {
        isLoading.value = true
        records.value = await store.fetchSubjects(id);
        isLoading.value = false
    },
    {
        immediate: true
    }
)
</script>