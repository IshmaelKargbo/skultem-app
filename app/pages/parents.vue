<template>
    <ParentAccountant v-if="can([Role.ACCOUNTANT])" />
    <ParentAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR])" />
</template>

<script setup lang="ts">
const { can } = useAuth()
definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR]
})
</script>