<template>
    <div class="p-7 space-y-5 h-full overflow-y-auto">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="space-y-1">
                <p class="text-2xl font-semibold">Report Builder</p>
                <p class="text-mute">Create custom reports and explore your school data</p>
            </div>
        </div>
        <div class="mt-5 flex">
            <Tab :tabs="[
                { label: 'Reports', to: '/analytics', exact: true },
                { label: 'Report Builder', to: '/analytics/builder', exact: true },
                { label: 'Saved Reports', to: '/analytics/saved', exact: true },
                { label: 'Dashboard Widgets', to: '/analytics/dashboard', exact: true }
            ]" />
        </div>
        <ReportBuilderSource @select="selectEntity" />
        <ReportBuilderFilters v-if="selected" :selected="selected" @change="filterChange" />
        <ReportBuilderRun />
    </div>
</template>

<script setup lang="ts">
const selected = ref<ReportSelectPayload>()
const query = ref<ReportSelectFilterPayload>()

function selectEntity(param: ReportSelectPayload) {
    selected.value = param
    query.value = {
        entity: param.entity,
        filters: []
    }
}

function filterChange(param: ReportSelectFilterPayload) {
    query.value = param
}

onMounted(() => {
    useAppStore().setTitle('Analytics')
    document.title = 'Report Builder | Analytics | Skultem'
})

definePageMeta({
    role: [Role.SCHOOL_ADMIN]
})
</script>