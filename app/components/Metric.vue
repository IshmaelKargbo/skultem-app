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
    <UCard class="h-full overflow-hidden">
        <div>
            <div v-if="!record.isReady" class="animate-pulse space-y-2">
                <USkeleton class="h-7 w-24" />
                <USkeleton class="h-4 w-28" />
            </div>
            <template v-else>
                <div class="flex justify-between items-center">
                    <div class="space-y-2">
                        <p class="text-[11px] uppercase tracking-wide text-muted md:text-xs">{{ record.label }}</p>
                        <p class="min-w-0 text-xl font-display font-semibold leading-tight sm:text-2xl">
                            {{ record.value }}
                        </p>

                        <div v-if="record.subtle"
                            :class="[`text-[11px] lg:text-xs text-${record.subtileColor || 'neutral-100'}`]">
                            <p>{{ record.subtle }}</p>
                        </div>
                    </div>

                    <div class="shrink-0">
                        <UBadge :icon="record.icon" variant="subtle" size="xl" class="p-2.5 rounded-xl"
                            :color="record.color" />
                    </div>
                </div>
            </template>
        </div>
    </UCard>
</template>
