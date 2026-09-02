<script setup lang="ts">
// Renamed to /payroll/salaries - "Salary Structure" reads more accurately than "Employees"
// for a page that's really about compensation, not staff records (that's /teachers).
await navigateTo('/payroll/salaries', { replace: true })

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
