<script lang="ts" setup>
const { subtitle, title } = defineProps<{
    title: string
    subtitle: string
}>()
</script>

<template>
    <UCard>
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="min-w-0 space-y-0.5">
                <p class="text-base font-display font-semibold leading-tight sm:text-xl md:text-2xl">
                    {{ title }}
                </p>
                <p class="text-xs text-mute">
                    {{ subtitle }}
                </p>
            </div>
            <div class="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:justify-end">
                <slot />
            </div>
        </div>
    </UCard>
</template>
