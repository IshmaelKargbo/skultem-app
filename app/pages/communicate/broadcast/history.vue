<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Broadcast History')
    document.title = 'Broadcast History | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>

<template>
    <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Broadcast History" subtitle="Review past and scheduled broadcasts">
            <UButton to="/communicate/broadcast" label="Compose Broadcast" :icon="BROADCAST_ICON" />
        </Heading>
        <CommunicateBroadcastHistoryTable />
    </div>
</template>
