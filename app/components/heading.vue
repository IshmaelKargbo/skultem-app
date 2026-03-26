<script lang="ts" setup>
const { subtitle, title } = defineProps<{
    title: string
    subtitle: string
}>()
</script>

<template>
    <div class="flex justify-between items-center">
        <div>
            <p class="text-2xl font-display font-semibold">{{ title }}</p>
            <p class="text-mute">{{ subtitle }}</p>
        </div>
        <slot />
    </div>
</template>
