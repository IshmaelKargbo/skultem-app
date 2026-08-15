<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Events & Holidays')
    document.title = 'Events & Holidays | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>

<template>
    <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Events & Holidays" subtitle="Manage the school's upcoming events and holidays">
            <CommunicateEventAdd />
        </Heading>
        <CommunicateEventTable />
    </div>
</template>
