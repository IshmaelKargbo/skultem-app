<template>
    <div class="md:px-5 py-2 md:py-4 overflow-y-auto p-4 h-full md:space-y-5 space-y-3">
        <ClassAccountantReport />
        <ClassAccountantTable />
    </div>
</template>

<script setup lang="ts">
onMounted(() => {
    useAppStore().setTitle('Classes');
    document.title = 'Classes | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT]
})
</script>