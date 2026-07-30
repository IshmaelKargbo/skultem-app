<template>
    <div class="space-y-4 p-4 sm:space-y-5 sm:p-6 lg:p-7">
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
