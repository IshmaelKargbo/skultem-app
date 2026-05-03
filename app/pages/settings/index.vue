<template>
    <div class="md:p-7 p-4 overflow-y-auto h-full md:space-y-5 space-y-3">
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
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR]
})
</script>
