<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Library')
    document.title = 'Library | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>

<template>
    <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Library Dashboard" subtitle="Overview of books, availability and loan activity">
            <div class="flex space-x-3">
                <UButton to="/library/issue" color="primary" :icon="ISSUE_BOOK_ICON" label="Issue / Return Book" />
            </div>
        </Heading>
        <LibraryDashboard />
    </div>
</template>
