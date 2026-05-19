<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-2 md:py-4 pb-0 space-y-3">
        <Heading title="Streams Management" subtitle="Manage all streams">
            <CurriculumsStreamAdd />
        </Heading>
        <CurriculumsStreamTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Curriculums')
    document.title = 'Streams | Curriculums | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>