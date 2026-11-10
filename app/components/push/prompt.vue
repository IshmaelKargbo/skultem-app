<!-- A one-time nudge to turn on device notifications - only when the device can show them and hasn't decided yet.
     "Not now" hides it for 30 days. The setting itself lives on the profile page. -->
<template>
  <Transition enter-from-class="translate-y-4 opacity-0" enter-active-class="transition duration-300"
    leave-to-class="translate-y-4 opacity-0" leave-active-class="transition duration-200">
    <div v-if="visible" role="dialog" aria-label="Turn on notifications"
      class="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-md rounded-2xl border border-default bg-default p-4 shadow-2xl sm:inset-x-auto sm:right-4 sm:bottom-4">
      <div class="flex items-start gap-3">
        <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UIcon name="i-lucide-bell-ring" class="size-5" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="font-semibold text-highlighted">Get notifications on this device?</p>
          <p class="mt-0.5 text-sm text-muted">Approvals, absences, fees and messages will pop up even when Skultem is closed.</p>
          <div class="mt-3 flex gap-2">
            <UButton size="sm" label="Turn on" :loading="busy" @click="turnOn" />
            <UButton size="sm" color="neutral" variant="ghost" label="Not now" @click="later" />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const SNOOZE_KEY = 'skultem:push-prompt-snoozed-until'
const { state, busy, refresh, enable, resync } = usePushNotifications()
const { success, error: toastError } = useNotify()
const { active: guideActive } = usePageGuide()
const ready = ref(false)

const snoozed = () => {
  try {
    return Number(localStorage.getItem(SNOOZE_KEY) || 0) > Date.now()
  } catch {
    return false
  }
}

// Only when the device can do it, hasn't said yes or no, and no page guide is showing.
const visible = computed(() => ready.value && state.value === 'off' && !guideActive.value
  && typeof Notification !== 'undefined' && Notification.permission === 'default' && !snoozed())

function later() {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + 30 * 24 * 3600 * 1000))
  } catch {}
  ready.value = false
}

async function turnOn() {
  try {
    const result = await enable()
    if (result === 'on') success('Notifications are on for this device')
    else if (result === 'blocked') later()
  } catch (err: any) {
    toastError(err?.message || 'Could not turn on notifications')
  }
}

onMounted(async () => {
  await resync()
  await refresh()
  // Give the first page a moment before asking.
  setTimeout(() => { ready.value = true }, 8000)
})
</script>
