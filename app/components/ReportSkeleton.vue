<script lang="ts" setup>
// Stand-in for a generated attendance report (school letterhead, stat tiles, then a table)
// while it's being generated.
withDefaults(defineProps<{
    stats?: number
}>(), {
    stats: 4
})
</script>

<template>
    <UCard>
        <div class="space-y-6">
            <div class="flex flex-col items-center gap-2">
                <USkeleton class="size-14 rounded-xl" />
                <USkeleton class="h-5 w-56" />
                <USkeleton class="h-3.5 w-40" />
            </div>

            <div class="grid grid-cols-2 gap-3" :class="stats === 5 ? 'sm:grid-cols-5' : 'sm:grid-cols-4'">
                <div v-for="i in stats" :key="i" class="space-y-2 rounded-xl border border-default p-3">
                    <USkeleton class="h-3 w-16" />
                    <USkeleton class="h-6 w-12" />
                </div>
            </div>

            <div class="overflow-hidden rounded-lg border border-default">
                <div v-for="row in 6" :key="row" class="flex gap-6 border-b border-default p-3 last:border-0">
                    <USkeleton v-for="col in 5" :key="col" class="h-4 flex-1" />
                </div>
            </div>
        </div>
    </UCard>
</template>
