<template>
    <BehaviourAdmin v-if="can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER])" />
    <BehaviourTeacher v-if="can([Role.TEACHER])" />
</template>

<script setup lang="ts">
const {can} = useAuth()

// Narrowed from [ADMIN, PROPRIETOR, PARENT, TEACHER, ACCOUNTANT, OWNER] - the page only ever
// renders <BehaviourAdmin> or <BehaviourTeacher> above; there's no Parent or Accountant view (no
// such component exists), so either of those roles landing here previously saw a blank page
// instead of being told it's not for them.
definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>