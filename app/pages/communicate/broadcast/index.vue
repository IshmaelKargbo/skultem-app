<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Compose Broadcast')
    document.title = 'Compose Broadcast | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>

<template>
    <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Compose Broadcast" subtitle="Send a message to students, parents, teachers or staff">
            <UButton to="/communicate/broadcast/history" label="Broadcast History" variant="outline" color="neutral" :icon="BROADCAST_HISTORY_ICON" />
        </Heading>
        <CommunicateBroadcastCompose />
    </div>
</template>
