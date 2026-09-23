<script setup lang="ts">
// Shown across the app while the school is in playground mode, so nobody mistakes test records
// for real ones. Owners/admins get a shortcut to the go-live screen in Settings.
const { school, hydrateFromCache } = useSchoolInfo()
const { can } = useAuth()

hydrateFromCache()

const visible = computed(() => !!school.value?.testSchool && !can(Role.SYSTEM_ADMIN))
const canManage = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]))
// Owner, proprietor or super admin - admins can open the screen but only review it.
const canGoLive = computed(() => can([Role.PROPRIETOR, Role.OWNER]))
</script>

<template>
  <div v-if="visible" class="px-4 pt-4 md:px-6">
    <div
      class="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm sm:px-4">
      <UIcon name="i-lucide-flask-conical" class="size-4 shrink-0 text-warning" />
      <p class="min-w-0 flex-1 text-toned">
        <span class="font-semibold text-highlighted">Playground mode.</span>
        Try anything - you'll choose what to clear before going live.
      </p>
      <UButton v-if="canManage" size="xs" color="warning" variant="soft" :label="canGoLive ? 'Go live' : 'Review'"
        :icon="canGoLive ? 'i-lucide-rocket' : 'i-lucide-eye'"
        to="/settings/school?section=playground" />
    </div>
  </div>
</template>
