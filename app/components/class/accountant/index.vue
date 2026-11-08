<template>
    <div class="space-y-3 px-4 md:px-6 ">
        <GuideBar topic="accountant-classes" />
        <div data-guide="acc-class-stats"><ClassAccountantReport /></div>
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
