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

const accentStyle = computed(() => ({
    borderTopColor: `var(--ui-${record.color === 'neutral' ? 'border-accented' : record.color})`
}))
</script>

<template>
    <UCard :ui="{
        body: 'p-3.5 md:p-4.5'
    }" class="h-full overflow-hidden border-t-2" :style="accentStyle">
        <div>
            <div v-if="!record.isReady" class="animate-pulse space-y-2">
                <USkeleton class="h-7 w-24" />
                <USkeleton class="h-4 w-28" />
            </div>
            <template v-else>
                <div class="flex justify-between items-center gap-2">
                    <div class="min-w-0 md:space-y-2 space-y-1">
                        <p class="truncate text-[9px] uppercase tracking-wide text-muted md:text-xs">{{ record.label }}</p>
                        <p class="min-w-0 truncate font-display font-semibold leading-tight text-base md:text-xl lg:text-2xl">
                            {{ record.value }}
                        </p>

                        <div v-if="record.subtle"
                            :class="[`truncate text-[8px] lg:text-xs text-${record.subtileColor || 'neutral-100'}`]">
                            <p class="truncate">{{ record.subtle }}</p>
                        </div>
                    </div>

                    <div class="hidden shrink-0 sm:block">
                        <UBadge :icon="record.icon" variant="subtle" size="xl" class="p-2.5 rounded-xl"
                            :color="record.color" />
                    </div>
                </div>
            </template>
        </div>
    </UCard>
</template>
