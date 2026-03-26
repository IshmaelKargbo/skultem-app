<template>
    <div class="p-7 h-full space-y-5 overflow-y-auto">
        <StudentAccountantReport />
        <StudentAccountantTable />
    </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>
