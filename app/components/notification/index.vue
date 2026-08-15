<script lang="ts" setup>
const store = useAppStore()
const { notifications } = storeToRefs(store)
useNotifications()

const displayCount = computed(() => notifications.value > 99 ? '99+' : notifications.value)

async function fetch() {
    await store.openNotifications()
}

onMounted(fetch)
</script>

<template>
    <UChip v-if="notifications > 0" :text="displayCount" color="error" size="3xl">
        <UButton color="neutral" to="/notifications" variant="ghost" :icon="BELL_ICON" aria-label="Notifications" />
    </UChip>
    <UButton v-else color="neutral" to="/notifications" variant="ghost" :icon="BELL_ICON" aria-label="Notifications" />
</template>
