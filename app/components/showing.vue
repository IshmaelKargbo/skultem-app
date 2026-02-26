<template>
    <div v-if="meta" class="flex space-x-2 text-sm text-muted">
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