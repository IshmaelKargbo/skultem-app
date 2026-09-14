<script setup lang="ts">
await navigateTo('/settings/school?section=attendance', { replace: true })

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
