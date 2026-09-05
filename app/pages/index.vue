<template>
    <DashboardAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])" />
    <DashboardAccountant v-if="can(Role.ACCOUNTANT)" />
    <DashboardTeacher v-if="can(Role.TEACHER)" />
    <DashboardParent v-if="can(Role.PARENT)" />
</template>
<script setup lang="ts">
const { can } = useAuth()

// A system admin isn't scoped to any one school, so there's no per-school dashboard for them
// here - bounce straight to their own. Reachable if they land on "/" directly (e.g. the sidebar
// logo/Dashboard link, which every role sees) rather than through the post-login redirect in
// login.vue, which already sends them here on sign-in.
if (can(Role.SYSTEM_ADMIN)) {
    await navigateTo('/system-admin')
}

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PARENT, Role.ACCOUNTANT, Role.TEACHER, Role.SYSTEM_ADMIN]
})
</script>
