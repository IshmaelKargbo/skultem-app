<template>
  <GradesApprovalAdmin v-if="can([Role.PROPRIETOR, Role.ADMIN, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN])" />

  <template v-else-if="can(Role.TEACHER)">
    <!-- Same shape as the approval list, so the page doesn't jump when it loads. -->
    <div v-if="loading || (!checked && !error)" class="px-4 md:px-6 space-y-3">
      <GradesSectionNav />
      <UCard :ui="{ body: 'p-0 sm:p-0', header: 'p-0 sm:p-0' }">
        <template #header>
          <div class="flex items-center justify-between gap-3 px-4 py-3">
            <USkeleton class="h-4 w-36" />
            <div class="flex gap-2">
              <USkeleton v-for="i in 3" :key="i" class="h-5 w-20 rounded-md" />
            </div>
          </div>
          <div class="border-t border-default px-4 py-3">
            <USkeleton class="h-8 w-full rounded-md" />
          </div>
        </template>
        <div class="divide-y divide-default">
          <GradesRecordLoading v-for="i in 4" :key="i" />
        </div>
      </UCard>
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
  role: [Role.ADMIN, Role.TEACHER, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
