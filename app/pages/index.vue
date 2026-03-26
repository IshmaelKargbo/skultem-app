<template>
    <div class="overflow-y-auto h-full">
        <DashboardAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR])" />
        <DashboardAccountant v-if="can(Role.ACCOUNTANT)" />
        <DashboardTeacher v-if="can(Role.TEACHER)" />
        <DashboardParent v-if="can(Role.PARENT)" />
    </div>
</template>
<script setup lang="ts">
const { can } = useAuth()
</script>