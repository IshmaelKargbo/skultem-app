<script lang="ts" setup>
const id = useRoute().params.id as string
const store = useSchemeOfWorkStore()
const { progress } = storeToRefs(store)
const isReady = ref(false)

onMounted(async () => {
    if (id) {
        await store.getProgress(id)
        isReady.value = true
    }
})
</script>

<template>
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric :record="{
            color: 'info',
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
            color: 'warning',
            label: 'Remaining',
            isReady: isReady,
            value: progress?.remaining || '0',
            icon: PENDING_ICON
        }" />
        <Metric :record="{
            color: 'primary',
            label: 'coverage',
            isReady: isReady,
            value: `${progress?.coverage || 0}%`,
            icon: 'i-lucide-chart-column'
        }" />
    </div>
</template>
