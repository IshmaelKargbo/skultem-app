<template>
    <div class="p-4 md:px-6 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Fee Categories" subtitle="Types of student fees">
            <FeeCategoryAdd />
        </Heading>
        <FeeCategoryTable />
    </div>
</template>

<script setup lang="ts">
const page = ref(1);
const { meta } = storeToRefs(useFeeStore());

onMounted(() => {
    useAppStore().setTitle('Settings');
    document.title = 'Fee Categories | Fees Payment | Skultem';
})

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
