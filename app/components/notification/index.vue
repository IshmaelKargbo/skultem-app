<script lang="ts" setup>
const store = useAppStore()
const { notifications } = storeToRefs(store)
useNotifications()

async function fetch() {
    await store.openNotifications()
}

onMounted(fetch)
</script>

<template>
    <UChip v-if="notifications > 0" :text="notifications" size="3xl">
        <UButton color="neutral" to="/notifications" variant="ghost" :icon="BELL_ICON" />
    </UChip>
    <UButton v-else color="neutral" to="/notifications" variant="ghost" :icon="BELL_ICON" />
</template>
