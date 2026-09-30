<script setup lang="ts">
await navigateTo('/settings/school?section=attendance', { replace: true })

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
