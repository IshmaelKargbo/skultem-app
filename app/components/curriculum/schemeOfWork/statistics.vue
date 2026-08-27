<script lang="ts" setup>
const route = useRoute()
const store = useSchemeOfWorkStore()
const { progress } = storeToRefs(store)
const isReady = ref(false)

watch(
    () => route.params.id,
    async (id) => {
        if (!id) return

        isReady.value = false
        await store.getProgress(id as string)
        isReady.value = true
    },
    { immediate: true }
)
</script>

<template>
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric :record="{
            color: 'neutral',
            label: 'Total Weeks',
            isReady: isReady,
            value: progress?.totalWeeks || '0',
            icon: CALANDA_ICON
        }" />
        <Metric :record="{
            color: 'success',
            label: 'Completed',
            isReady: isReady,
            value: progress?.completed || '0',
            icon: CHECK_ICON
        }" />
        <Metric :record="{
            color: 'error',
            label: 'Remaining',
            isReady: isReady,
            value: progress?.remaining || '0',
            icon: PENDING_ICON
        }" />
        <Metric :record="{
            color: 'info',
            label: 'coverage',
            isReady: isReady,
            value: `${progress?.coverage || 0}%`,
            icon: 'i-lucide-chart-column'
        }" />
    </div>
</template>
