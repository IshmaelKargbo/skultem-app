<template>
    <DashboardAdmin v-if="can(Role.SCHOOL_ADMIN)" />
    <DashboardParent v-if="can(Role.PARENT)" />
</template>
<script setup lang="ts">
const { can } = useAuth()
</script>