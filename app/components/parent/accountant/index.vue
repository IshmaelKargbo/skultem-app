<template>
    <div class="px-4 md:px-6 space-y-4">
        <ParentAccountantReport />
        <ParentAccountantTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Parents');
    document.title = 'Parents | Skultem'
})
</script>
