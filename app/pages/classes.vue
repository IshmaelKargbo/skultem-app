<template>
    <ClassAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR])" />
    <ClassAccountant v-if="can([Role.ACCOUNTANT])" />
</template>

<script setup lang="ts">
const { can } = useAuth()

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.ACCOUNTANT]
})
</script>