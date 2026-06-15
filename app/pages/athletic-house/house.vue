<template>
    <div class="md:p-7 p-4 overflow-y-auto h-full md:space-y-5 space-y-3">
        <Heading title="Athletic Categories" subtitle="School spending categories">
            <AthleticCategoryAdd />
        </Heading>
        <AthleticCategoryTable />    
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Settings');
    document.title = 'Athletic Categories | Athletic | Skultem';
})

definePageMeta({
    role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
