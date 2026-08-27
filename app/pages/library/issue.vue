<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Issue / Return Book')
    document.title = 'Issue / Return Book | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>

<template>
    <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Issue / Return Book" subtitle="Track books currently on loan and process returns">
            <LibraryIssueForm />
        </Heading>
        <LibraryIssueTable />
    </div>
</template>
