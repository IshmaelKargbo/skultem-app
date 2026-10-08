<template>
  <!-- Management sees report cards for the whole school; a teacher only if they're a class master. -->
  <slot v-if="!isTeacherOnly || isClassMaster" />

  <div v-else-if="loading || (!checked && !error)">
    <USkeleton class="h-40 w-full rounded-2xl" />
  </div>

  <UCard v-else-if="error">
    <div class="flex flex-col items-center gap-3 py-10 text-center">
      <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-error/10">
        <UIcon name="i-lucide-alert-triangle" class="text-3xl text-error" />
      </div>
      <p class="text-sm font-semibold text-highlighted">Couldn't check class master status</p>
      <p class="max-w-xs text-xs text-muted">{{ error }}</p>
      <UButton label="Try again" :icon="REFRESH_ICON" color="primary" variant="soft" @click="ensureLoaded()" />
    </div>
  </UCard>

  <UCard v-else>
    <div class="flex flex-col items-center gap-3 py-10 text-center">
      <div class="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary-50 dark:bg-primary-500/10">
        <UIcon name="i-lucide-lock" class="text-3xl text-primary-500" />
      </div>
      <p class="text-sm font-semibold text-highlighted">Report cards are for class masters</p>
      <p class="max-w-xs text-xs text-muted">You're not a class master of any class, so there are no report cards for
        you to generate or remark.</p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
const { can } = useAuth()
const { isClassMaster, loading, checked, error, ensureLoaded } = useClassMaster()

const isTeacherOnly = computed(() =>
  can(Role.TEACHER) && !can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]))

onMounted(() => {
  ensureLoaded()
})
</script>
