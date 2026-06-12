<template>
    <div class="p-4 sm:p-6 lg:p-7 h-full space-y-4 sm:space-y-5 overflow-y-auto">
        <Heading title="Student Finance Overview" subtitle="Track student fee status, balances, and collections." />
        <StudentAccountantReport />
        <StudentAccountantTable />
    </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>
