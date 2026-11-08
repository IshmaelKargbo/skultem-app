<template>
    <div class="px-4 md:px-6 space-y-3">
        <GuideBar topic="accountant-parents" />
        <div data-guide="acc-parent-stats"><ParentAccountantReport /></div>
        <ParentAccountantTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Parents');
    document.title = 'Parents | Skultem'
})
</script>
