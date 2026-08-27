<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Compose Broadcast')
    document.title = 'Compose Broadcast | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>

<template>
    <div class="px-4 md:px-6 space-y-4">
        <Heading title="Compose Broadcast" subtitle="Send a message to students, parents, teachers or staff">
            <UButton to="/communicate/broadcast/history" label="Broadcast History" variant="outline" color="neutral" :icon="BROADCAST_HISTORY_ICON" />
        </Heading>
        <CommunicateBroadcastCompose />
    </div>
</template>
