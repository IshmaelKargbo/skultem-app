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
        <div class="space-y-2">
            <p class="text-xs text-mute">{{ record.label }}</p>

            <div v-if="!record.isReady" class="animate-pulse space-y-2">
                <div class="h-7 w-24 bg-gray-200 rounded" />
                <div class="h-4 w-28 bg-gray-200 rounded" />
            </div>

            <template v-else>
                <div class="flex justify-between items-center">
                    <p class="text-2xl font-display font-semibold">{{ record.value }}</p>
                    <UBadge :icon="record.icon" variant="subtle" size="xl" class="p-1.5" :color="record.color" />
                </div>
                <div v-if="record.subtle" :class="[`text-xs text-${record.subtileColor|| 'neutral-100'}`]">
                    <p>{{ record.subtle }}</p>
                </div>
            </template>
        </div>
    </UCard>
</template>
