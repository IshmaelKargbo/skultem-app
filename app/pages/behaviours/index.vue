<template>
    <BehaviourAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN])" />
    <BehaviourTeacher v-if="can([Role.TEACHER])" />
</template>

<script setup lang="ts">
const {can} = useAuth()

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>