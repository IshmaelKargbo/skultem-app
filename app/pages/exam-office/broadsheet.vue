<script setup lang="ts">
// The broadsheet is now the Grade Book's "Report cards" view - one page for a class's results. Old links land there.
await navigateTo({ path: '/gradebook', query: { source: 'cards' } }, { replace: true })

definePageMeta({
  role: [Role.EXAM_OFFICER, Role.ADMIN, Role.PRINCIPAL, Role.OWNER, Role.PROPRIETOR, Role.SUPER_ADMIN]
})
</script>

<template>
  <div />
</template>
