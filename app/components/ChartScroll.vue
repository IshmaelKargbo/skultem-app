<script lang="ts" setup>
// Wraps a cartesian chart (bar/line/area) so a phone screen scrolls it sideways instead of squeezing
// every bar and axis label into ~350px. From md up it's a plain block and the chart fills its card as
// before. Pie/donut charts don't need it - they're round and already fit.
</script>

<template>
    <div class="-mx-1 overflow-x-auto overscroll-x-contain px-1 md:mx-0 md:overflow-visible md:px-0">
        <div class="min-w-140 md:min-w-0">
            <slot />
        </div>
    </div>
</template>
