<template>
    <div class="p-4 sm:p-6 lg:p-7 overflow-y-auto h-full space-y-4 sm:space-y-5">
        <Heading title="Fee Categories" subtitle="Types of student fees">
            <SettingsFeeCategoryAdd />
        </Heading>
        <SettingsFeeCategoryTable />
    </div>
</template>

<script setup lang="ts">
const page = ref(1);
const { meta } = storeToRefs(useFeeStore());

onMounted(() => {
    useAppStore().setTitle('Settings');
    document.title = 'Fee Categories | Settings | Skultem';
})

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
