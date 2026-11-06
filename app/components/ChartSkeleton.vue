<script lang="ts" setup>
// Stand-in for a 350px ApexCharts bar chart (title, subtitle, bars) while its data loads.
// Same height as the chart so the card doesn't jump when it swaps in.
const bars = [55, 80, 40, 70, 90, 60]
</script>

<template>
    <div class="flex h-[350px] flex-col gap-2" aria-busy="true" aria-label="Loading chart">
        <USkeleton class="h-4 w-36" />
        <USkeleton class="h-3 w-56" />
        <div class="mt-4 flex flex-1 items-end gap-4 border-b border-l border-default px-4 pb-px">
            <USkeleton v-for="(h, i) in bars" :key="i" class="flex-1 rounded-b-none" :style="{ height: `${h}%` }" />
        </div>
    </div>
</template>
