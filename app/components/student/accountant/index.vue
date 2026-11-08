<template>
    <div class="px-4 md:px-6 space-y-3">
        <GuideBar topic="accountant-students" />
        <div data-guide="fin-students-summary"><StudentAccountantReport /></div>
        <div data-guide="fin-students-list"><StudentAccountantTable /></div>
    </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>
