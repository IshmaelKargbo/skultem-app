<template>
    <div class="p-5 space-y-5">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="space-y-1">
                <p class="text-2xl font-semibold">Report Builder</p>
                <p class="text-mute text-xs">Create custom reports and explore your school data</p>
            </div>
        </div>
        <div class="mt-5 flex">
            <Tab :tabs="[
                { label: 'Reports', to: '/analytics', exact: true },
                { label: 'Report Builder', to: '/analytics/builder', exact: true },
                { label: 'Saved Reports', to: '/analytics/saved', exact: true }
            ]" />
        </div>
        <ReportBuilderSource @select="selectEntity" />
        <ReportBuilderFilters v-if="selected" :selected="selected" @change="filterChange" />
        <ReportBuilderRun />
    </div>
</template>

<script setup lang="ts">
const selected = ref<ReportSelectPayload>()
function selectEntity(param: ReportSelectPayload) {
    selected.value = param
}

function filterChange(params: ReportSelectPayload) {
    console.log(params)
}

onMounted(() => {
    useAppStore().setTitle('Analytics')
    document.title = 'Report Builder | Analytics | Skultem'
})
</script>
