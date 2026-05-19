<template>
    <div class="overflow-y-auto h-full">
        <DashboardAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])" />
        <DashboardAccountant v-if="can(Role.ACCOUNTANT)" />
        <DashboardTeacher v-if="can(Role.TEACHER)" />
        <DashboardParent v-if="can(Role.PARENT)" />
    </div>
</template>
<script setup lang="ts">
const { can } = useAuth()

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PARENT, Role.ACCOUNTANT, Role.TEACHER]
})
</script>