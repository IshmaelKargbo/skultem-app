<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Notice Board')
    document.title = 'Notice Board | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>

<template>
    <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Notice Board" subtitle="Post and manage notices for the school community">
            <CommunicateNot iceAdd />
        </Heading>
        <CommunicateNoticeList />
    </div>
</template>
