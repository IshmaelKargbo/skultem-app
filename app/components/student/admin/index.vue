<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-2 md:py-4 pb-0 space-y-3">
        <Heading title="Students Management" subtitle="Organize academic classes">
            <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 w-full md:w-auto">
                <UInput placeholder="Search by name or admission number" />
                <UButton to="/students/add" class="items-center flex justify-center" color="primary" label="Enrolled Student" :icon="ADD_ICON" />
            </div>
        </Heading>
        <StudentAdminTable />
    </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>
