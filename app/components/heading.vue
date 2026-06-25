<script lang="ts" setup>
const { subtitle, title } = defineProps<{
    title: string
    subtitle: string
}>()
</script>

<template>
    <div class="flex flex-col gap-3 px-2 sm:px-0 md:flex-row md:items-center md:justify-between">
        <div class="min-w-0 space-y-0.5 hidden md:block">
            <p class="text-xl md:text-2xl font-display font-semibold">{{ title }}</p>
            <p class="text-sm text-mute">{{ subtitle }}</p>
        </div>
        <slot />
    </div>
</template>
