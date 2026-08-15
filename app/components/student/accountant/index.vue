<template>
    <div class="p-4 md:px-6 space-y-5">
        <Heading title="Student Finance Overview" subtitle="Track student fee status, balances, and collections." />
        <StudentAccountantReport />
        <StudentAccountantTable />
    </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>
