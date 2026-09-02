<script setup lang="ts">
// The HR and Payroll dashboards were previously two separate mock-only pages that duplicated
// most of the same content (staff, payroll summary, leave requests). They've been merged into
// one real "Payroll" module - Leave and Teacher Attendance still live under /hr.
await navigateTo('/payroll', { replace: true })

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
