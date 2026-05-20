<template>
    <div class="md:p-7 p-4 h-full space-y-5 overflow-y-auto">
        <Heading title="Student Finance Overview" subtitle="Track student fee status, balances, and collections." />
        <StudentAccountantReport />
        <StudentAccountantTable />
    </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>
