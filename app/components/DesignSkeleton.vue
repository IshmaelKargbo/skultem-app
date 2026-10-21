<script lang="ts" setup>
// Stand-in for the "settings form beside a live preview" layout shared by the design pages
// (receipt, payslip, report card, timetable, ID card) while their saved settings load.
// previewWide: the preview takes the larger column (ID card, timetable) instead of the form.
defineProps<{
    previewWide?: boolean
}>()
</script>

<template>
    <div class="grid gap-6 lg:grid-cols-3">
        <div class="space-y-6" :class="previewWide ? '' : 'lg:col-span-2'">
            <UCard v-for="card in 2" :key="card">
                <template #header>
                    <div class="flex items-center gap-3">
                        <USkeleton class="size-8 rounded-lg" />
                        <div class="space-y-1.5">
                            <USkeleton class="h-4 w-32" />
                            <USkeleton class="h-3 w-48" />
                        </div>
                    </div>
                </template>
                <div class="space-y-4">
                    <div v-for="row in 3" :key="row" class="space-y-2">
                        <USkeleton class="h-3.5 w-24" />
                        <USkeleton class="h-8 w-full" />
                    </div>
                </div>
            </UCard>
        </div>

        <div :class="previewWide ? 'lg:col-span-2' : ''">
            <UCard>
                <div class="space-y-4">
                    <div class="flex items-center gap-3">
                        <USkeleton class="size-12 rounded-xl" />
                        <div class="space-y-1.5">
                            <USkeleton class="h-4 w-36" />
                            <USkeleton class="h-3 w-24" />
                        </div>
                    </div>
                    <USkeleton class="w-full rounded-lg" :class="previewWide ? 'h-96' : 'h-72'" />
                    <div class="flex justify-between">
                        <USkeleton class="h-3.5 w-24" />
                        <USkeleton class="h-3.5 w-16" />
                    </div>
                </div>
            </UCard>
        </div>
    </div>
</template>
