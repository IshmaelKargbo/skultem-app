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
const record = ref<Clazz | null>(null)
const isLoading = ref(false)

watch(
    () => id,
    async () => {
        if (!id) {
            record.value = null
            isLoading.value = false
            return
        }

        isLoading.value = true
        record.value = await store.findOne(id);
        isLoading.value = false
    },
    {
        immediate: true
    }
)
</script>