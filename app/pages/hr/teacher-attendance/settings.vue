<script setup lang="ts">
// Moved into the main Settings hub, alongside every other school-wide setting.
await navigateTo('/settings/school?section=attendance', { replace: true })

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
