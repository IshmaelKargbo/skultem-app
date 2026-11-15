<!-- A one-time nudge to turn on device notifications - only when the device can show them and hasn't decided yet.
     "Not now" hides it for 30 days. The setting itself lives on the profile page.
     It sits centred on screen, above everything (the mobile menu is z-1100), so nothing can cover its buttons. -->
<template>
  <Transition enter-from-class="opacity-0 [&>div]:scale-95" enter-active-class="transition duration-300 [&>div]:transition [&>div]:duration-300"
    leave-to-class="opacity-0 [&>div]:scale-95" leave-active-class="transition duration-200 [&>div]:transition [&>div]:duration-200">
    <div v-if="visible"
      class="fixed inset-0 z-1200 flex items-center justify-center bg-black/40 px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] backdrop-blur-[2px]">
      <div role="dialog" aria-modal="true" aria-label="Turn on notifications"
        class="w-full max-w-md rounded-2xl border border-default bg-default p-5 shadow-2xl">
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
