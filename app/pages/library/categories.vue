<script lang="ts" setup>
onMounted(() => {
    useAppStore().setTitle('Book Categories')
    document.title = 'Book Categories | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>

<template>
    <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Book Categories" subtitle="Organize the library catalog into categories">
            <LibraryCategoryAdd />
        </Heading>
        <LibraryCategoryTable />
    </div>
</template>
