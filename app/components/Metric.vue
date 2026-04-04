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
</script>

<template>
    <UCard>
        <div class="md:space-y-2 space-y-1">
            <p class="md:text-xs text-[11px] text-mute">{{ record.label }}</p>

            <div v-if="!record.isReady" class="animate-pulse space-y-2">
                <div class="h-7 w-24 bg-gray-200 rounded" />
                <div class="h-4 w-28 bg-gray-200 rounded" />
            </div>

            <template v-else>
                <div class="flex justify-between items-center">
                    <p class="md:text-2xl text-lg font-display font-semibold">{{ record.value }}</p>
                    <UBadge :icon="record.icon" variant="subtle" size="xl" class="p-1.5 hidden md:block" :color="record.color" />
                    <UBadge class="md:hidden" :icon="record.icon" variant="subtle" size="lg" :color="record.color" />
                </div>
                <div v-if="record.subtle" :class="[`md:text-xs text-[11px] text-${record.subtileColor|| 'neutral-100'}`]">
                    <p>{{ record.subtle }}</p>
                </div>
            </template>
        </div>
    </UCard>
</template>
