<template>
    <div class="px-4 md:px-6 space-y-4">
        <StudentAccountantReport />
        <StudentAccountantTable />
    </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>
