<template>
    <ClassAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])" />
    <ClassAccountant v-if="can([Role.ACCOUNTANT])" />
</template>

<script setup lang="ts">
const { can } = useAuth()

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.ACCOUNTANT, Role.OWNER]
})
</script>