<template>
    <div class="p-5">
        <SettingsHeader title="Academic Years" subtitle="Configured academic sessions">
            <SettingsAdd />
        </SettingsHeader>
        <UCard>
            <SettingsTable />
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
const { meta } = storeToRefs(useAcademicYearStore());

onMounted(() => {
    useAppStore().setTitle('Settings')
    document.title = 'Academic Years | Settings | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>
