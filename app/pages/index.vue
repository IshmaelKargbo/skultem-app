<template>
    <div class="overflow-y-auto h-full">
        <DashboardAdmin v-if="can(Role.SCHOOL_ADMIN)" />
        <DashboardParent v-if="can(Role.PARENT)" />
    </div>
</template>
<script setup lang="ts">
const { can } = useAuth()
</script>