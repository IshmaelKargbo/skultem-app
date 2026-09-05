<script lang="ts" setup>
// Small section-header pattern: a colored accent bar + title + a one-line explanation of
// what the section is/is for, instead of a bare heading. Cheap to reuse anywhere a page
// groups cards under a label and wants that label to actually explain something rather
// than just name it.
const { title, subtitle, accent = 'primary' } = defineProps<{
    title: string
    subtitle?: string
    accent?: 'primary' | 'secondary'
}>()
</script>

<template>
    <div class="space-y-0.5">
        <div class="flex items-center gap-2">
            <span class="h-4 w-1 rounded-full" :class="accent === 'secondary' ? 'bg-secondary-500' : 'bg-primary-500'" />
            <h3 class="text-sm font-semibold text-highlighted">{{ title }}</h3>
        </div>
        <p v-if="subtitle" class="pl-3 text-xs text-muted">{{ subtitle }}</p>
    </div>
</template>
