<template>
    <ParentAccountant v-if="can([Role.ACCOUNTANT])" />
    <ParentAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN])" />
</template>

<script setup lang="ts">
const { can } = useAuth()
definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>