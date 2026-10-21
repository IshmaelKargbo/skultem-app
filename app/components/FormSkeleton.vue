<script lang="ts" setup>
// Stand-in for a grid of UFormFields while an edit form's record is still being fetched,
// so the fields don't render empty and then jump once the values arrive.
withDefaults(defineProps<{
    fields?: number
}>(), {
    fields: 4
})
</script>

<template>
    <div class="grid gap-5 md:grid-cols-2">
        <div v-for="i in fields" :key="i" class="space-y-2">
            <USkeleton class="h-3.5 w-24" />
            <USkeleton class="h-8 w-full" />
        </div>
    </div>
</template>
