<template>
    <div class="p-4 sm:p-6 lg:p-7 space-y-4 sm:space-y-5 h-full overflow-y-auto">
      <Heading title="Parent Finance Overview" subtitle="Track parent-linked students, balances, and collections" />
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
