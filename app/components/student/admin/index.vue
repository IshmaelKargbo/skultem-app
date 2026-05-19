<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-2 md:py-4 pb-0 space-y-3">
        <Heading title="Students Management" subtitle="Organize academic classes">
            <div class="flex space-x-2">
                <UInput placeholder="Search by name" />
                <UButton to="/students/add" color="primary" label="Enrolled Student" :icon="ADD_ICON" />
            </div>
        </Heading>
        <StudentAdminTable />
    </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>
