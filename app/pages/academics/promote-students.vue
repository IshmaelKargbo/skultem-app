<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Promote Students')
    document.title = 'Promote Students | Academics | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>

<template>
    <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Promote Students" subtitle="Move students from one class to the next academic level" />
        <AcademicsPromoteWorkflow />
        <AcademicsPromoteHistory />
    </div>
</template>
