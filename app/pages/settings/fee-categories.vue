<template>
    <div class="p-7 h-full overflow-y-auto">
        <SettingsHeader title="Fee Categories" subtitle="Types of student fees">
            <SettingsFeeCategoryAdd />
        </SettingsHeader>
        <UCard>
            <SettingsFeeCategoryTable />
            <div class="flex justify-between border-t border-gray-200 pt-3 items-center">
                <Showing :meta="meta" />
                <UPagination size="sm" v-model:page="page" :page-size="meta.size" :items-per-page="meta.size"
                    :total="meta.total" show-edges />
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const page = ref(1);
const { meta } = storeToRefs(useTermStore());

onMounted(() => {
    useAppStore().setTitle('Settings');
    document.title = 'Fee Categories | Settings | Skultem';
})

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR]
})
</script>
