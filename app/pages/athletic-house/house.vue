<template>
    <div class="md:p-7 p-4 overflow-y-auto h-full md:space-y-5 space-y-3">
        <Heading title="Athletic House" subtitle="Create and manage athletic houses for student assignment">
            <AthleticCategoryAdd />
        </Heading>
        <AthleticCategoryTable />    
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Athletic Management');
    document.title = 'Athletic Categories | Athletic Management | Skultem';
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
