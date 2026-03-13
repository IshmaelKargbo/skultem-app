<template>
    <div class="space-y-5">
        <UCard>
            <div class="flex space-x-3">
                <UButton :icon="PLAY_ICON" label="Run Query" class="flex-1 justify-center" size="lg" color="primary" />
                <UInput class="w-80" placeholder="Report Name" />
                <UButton :icon="SAVE_ICON" label="Save Report" size="lg" color="neutral" variant="outline" />
            </div>
        </UCard>
        <UCard>
            <StudentTable />
        </UCard>
        <UCard>
            <div>
                <p>Export Report</p>
                <div class="mt-3 grid-cols-4 grid gap-3">
                    <UButton :icon="DOWNLOAD_ICON" label="Export CSV" size="xl" class="w-full flex justify-center"
                        color="neutral" variant="outline" />
                    <UButton :icon="DOWNLOAD_ICON" label="Export Excel" size="xl" class="w-full flex justify-center"
                        color="neutral" variant="outline" />
                    <UButton :icon="DOWNLOAD_ICON" label="Export PDF" size="xl" class="w-full flex justify-center"
                        color="neutral" variant="outline" />
                    <UButton :icon="DOWNLOAD_ICON" label="Export JSON" size="xl" class="w-full flex justify-center"
                        color="neutral" variant="outline" />
                </div>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">

</script>