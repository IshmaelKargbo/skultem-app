<script setup lang="ts">
// Replaced by /payroll/runs (a real list of runs) and /payroll/runs/new (to start one) -
// a single run is no longer assumed to be "the current month," runs are now a real history.
await navigateTo('/payroll/runs', { replace: true })

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
