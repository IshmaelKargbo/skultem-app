<template>
  <GradesApprovalAdmin v-if="can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER])" />

  <template v-else-if="can(Role.TEACHER)">
    <!-- Still loading, or haven't successfully checked yet - never fall through to "you're not a
         class master" on the strength of a still-pending or failed check (see useClassMaster). -->
    <div v-if="loading || (!checked && !error)" class="px-4 md:px-6">
      <USkeleton class="h-40 w-full rounded-2xl" />
    </div>

    <div v-else-if="error" class="px-4 md:px-6">
      <UCard>
        <div class="flex flex-col items-center gap-3 py-10 text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-error/10">
            <UIcon name="i-lucide-alert-triangle" class="text-3xl text-error" />
          </div>
          <p class="text-sm font-semibold text-highlighted">Couldn't check class master status</p>
          <p class="max-w-xs text-xs text-muted">{{ error }}</p>
          <UButton label="Try again" :icon="REFRESH_ICON" color="primary" variant="soft" @click="ensureLoaded()" />
        </div>
      </UCard>
    </div>

    <GradesApprovalTeacher v-else-if="isClassMaster" />

    <!-- Grading is submit (subject teacher) / approve (class master) - a subject-only teacher
         has nothing to approve here, so point them at where they actually act instead. -->
    <div v-else class="px-4 md:px-6">
      <UCard>
        <div class="flex flex-col items-center gap-3 py-10 text-center">
          <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
            <UIcon name="i-lucide-lock" class="text-3xl text-primary-500" />
          </div>
          <p class="text-sm font-semibold text-highlighted">Grade approval is only for the class master</p>
          <p class="max-w-xs text-xs text-muted">You're not a class master, so there's nothing here for you to approve. Submit your own grades from Grade Assignment instead.</p>
          <UButton to="/grades" label="Go to Grade Assignment" :icon="GRADES_ICON" color="primary" variant="soft" />
        </div>
      </UCard>
    </div>
  </template>
</template>

<script setup lang="ts">
const { can } = useAuth()
const { isClassMaster, loading, checked, error, ensureLoaded } = useClassMaster()

onMounted(() => {
  ensureLoaded()
})

definePageMeta({
  role: [Role.ADMIN, Role.TEACHER, Role.PROPRIETOR, Role.OWNER]
})
</script>
