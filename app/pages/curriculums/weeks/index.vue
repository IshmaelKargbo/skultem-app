<template>
  <div />
</template>

<script setup lang="ts">
// Weeks only make sense within a scheme (/curriculums/<scheme id>), and this URL carries none - send
// people to the scheme list to pick one. Kept as a stub rather than deleted: without it,
// /curriculums/weeks would match /curriculums/[id] and try to load a scheme with id "weeks".
definePageMeta({
  redirect: '/curriculums'
})
</script>
