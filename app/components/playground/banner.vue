<script setup lang="ts">
const { school, hydrateFromCache } = useSchoolInfo()
const { can } = useAuth()

hydrateFromCache()

const visible = computed(() => !!school.value?.testSchool && !can(Role.SYSTEM_ADMIN))
const canManage = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]))
const canGoLive = computed(() => can([Role.PROPRIETOR, Role.OWNER]))
</script>

<template>
  <div v-if="visible" class="px-4 pt-3 md:px-6">
    <div
      class="flex flex-wrap items-center gap-3 rounded-2xl border border-warning/30 bg-linear-to-r from-warning/15 via-warning/5 to-transparent px-3 py-2.5 sm:px-4">
      <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
        <UIcon name="i-lucide-flask-conical" class="size-4" />
      </div>
      <p class="min-w-0 flex-1 text-sm text-toned">
        <span class="font-semibold text-highlighted">Playground mode</span>
        <span class="hidden sm:inline"> - try anything. You'll choose what to clear before going live.</span>
      </p>
      <UButton v-if="canManage" size="sm" color="warning" variant="solid"
        :label="canGoLive ? 'Go live' : 'Review'" :icon="canGoLive ? 'i-lucide-rocket' : 'i-lucide-eye'"
        to="/settings/school?section=playground" />
    </div>
  </div>
</template>
