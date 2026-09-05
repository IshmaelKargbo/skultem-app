<script lang="ts" setup>
const { record } = defineProps<{
    record: {
        label: string
        isReady?: boolean
        value: any
        subtle?: string
        icon: string
        color: "success" | "warning" | "error" | "info" | "primary" | "neutral"
        subtileColor?: "success" | "warning" | "error" | "info" | "primary" | "neutral"
    }
}>()

// A thin brand-colored top edge instead of a flat white slab on every stat card
// everywhere Metric is used - a cheap, safe visual upgrade (no layout change)
// that reads as "modern" and gives each number a color identity at a glance.
const accentStyle = computed(() => ({
    borderTopColor: `var(--ui-${record.color === 'neutral' ? 'border-accented' : record.color})`
}))
</script>

<template>
    <UCard class="h-full overflow-hidden border-t-2" :style="accentStyle">
        <div>
            <div v-if="!record.isReady" class="animate-pulse space-y-2">
                <USkeleton class="h-7 w-24" />
                <USkeleton class="h-4 w-28" />
            </div>
            <template v-else>
                <div class="flex justify-between items-center gap-2">
                    <!-- min-w-0 lets the value truncate instead of pushing the icon off a
                         narrow card - most dashboards show these three-up on mobile. -->
                    <div class="min-w-0 space-y-2">
                        <p class="truncate text-[11px] uppercase tracking-wide text-muted md:text-xs">{{ record.label }}</p>
                        <p class="min-w-0 truncate text-2xl font-display font-semibold leading-tight sm:text-xl lg:text-2xl">
                            {{ record.value }}
                        </p>

                        <div v-if="record.subtle"
                            :class="[`truncate text-[11px] lg:text-xs text-${record.subtileColor || 'neutral-100'}`]">
                            <p class="truncate">{{ record.subtle }}</p>
                        </div>
                    </div>

                    <!-- Hidden below sm - on a narrow card the icon was purely decorative
                         weight competing with the value for width; it returns once there's
                         room for both without cramping the number. -->
                    <div class="hidden shrink-0 sm:block">
                        <UBadge :icon="record.icon" variant="subtle" size="xl" class="p-2.5 rounded-xl"
                            :color="record.color" />
                    </div>
                </div>
            </template>
        </div>
    </UCard>
</template>
