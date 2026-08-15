<template>
    <div class="p-4 md:px-6  overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Behaviour Categories" subtitle="Student conduct classifications">
            <BehaviourCategoriesAdd />
        </Heading>
        <BehaviourCategoriesTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Behaviour');
    document.title = 'Behavoiur Categories | Behaviour | Skultem';
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
