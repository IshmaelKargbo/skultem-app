<template>
    <div>
        <USkeleton v-if="isLoading" class="h-3 w-32" />
        <slot v-else-if="record" :value="record" />
        <slot v-else name="empty-state" />
    </div>
</template>

<script setup lang="ts">
const { id } = defineProps<{
    id: string
}>()
const store = useClassStore()
const record = ref<ClassTeacher[] | null>(null)
const isLoading = ref(false)

watch(
    () => id,
    async () => {
        try {
            if (id == null) return null;
            isLoading.value = true
            record.value = await store.findClassMaster(id)
        } catch (error) {
            record.value = null
        } finally {
            isLoading.value = false
        }
    },
    {
        immediate: true
    }
)
</script>