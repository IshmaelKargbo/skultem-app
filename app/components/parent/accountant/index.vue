<template>
    <div class="p-7 space-y-5 h-full overflow-y-auto">
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