<template>
    <div v-if="meta" class="flex text-xs md:space-x-2 space-x-1 md:text-sm text-muted">
        <span>Showing</span>
        <span>{{ meta.showingFrom }} - {{ meta.showingTo }}</span>
        <span>of</span>
        <span>{{ meta.total }}</span>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    meta: Meta | null;
}>()
</script>