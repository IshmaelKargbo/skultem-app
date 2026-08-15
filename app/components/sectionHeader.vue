<script lang="ts" setup>
defineProps<{
    icon: string
    label: string
}>()
</script>

<template>
    <div class="flex items-center gap-2 rounded-lg border-l-4 border-primary bg-primary-50 px-3 py-2 dark:bg-primary-500/10">
        <UIcon :name="icon" class="size-4 text-primary" />
        <p class="text-xs font-semibold uppercase tracking-wide text-primary">{{ label }}</p>
    </div>
</template>
