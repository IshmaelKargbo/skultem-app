<template>
  <div class="px-4 md:px-6">
    <UCard>
      <p class="text-sm text-muted">
        Scoring is now set per assessment template. Taking you to Assessment Templates...
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
// Continuous assessment moved onto the assessment template (Scoring), so a school can score each template its own
// way. Old links and bookmarks land there.
onMounted(() => navigateTo('/academics/assessment-templates', { replace: true }))

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
