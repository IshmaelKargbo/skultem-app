<template>
    <BehaviourAdmin v-if="can([Role.ADMIN])" />
    <BehaviourTeacher v-if="can([Role.TEACHER])" />
</template>

<script setup lang="ts">
const {can} = useAuth()

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.PARENT, Role.TEACHER, Role.ACCOUNTANT]
})
</script>