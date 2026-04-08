<template>
    <div class="md:p-7 overflow-y-auto h-full md:space-y-5 p-4 space-y-3">
        <Heading title="Students Management" subtitle="Organize academic classes">
            <div class="flex space-x-2">
                <UInput placeholder="Search by name" />
                <StudentAdd />
            </div>
        </Heading>
        <StudentAdminTable v-if="can([Role.ADMIN, Role.PROPRIETOR])" />
    </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>
