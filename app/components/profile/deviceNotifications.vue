<!-- Native notifications on this device (phone or computer): turn on/off, and send yourself a test. -->
<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 class="text-lg font-semibold">Device Notifications</h3>
          <p class="text-sm text-muted">Pop-up notifications on this phone or computer, even when Skultem is closed.</p>
        </div>
        <UBadge :color="badge.color" variant="subtle" :icon="badge.icon" :label="badge.label" />
      </div>
    </template>

    <div class="space-y-3">
      <UAlert v-if="state === 'needs-install'" color="info" variant="subtle" icon="i-lucide-smartphone"
        title="Add Skultem to your Home Screen first"
        description="On iPhone and iPad, tap Share, then Add to Home Screen. Open Skultem from there and turn notifications on." />
      <UAlert v-else-if="state === 'unsupported'" color="neutral" variant="subtle" icon="i-lucide-bell-off"
        title="This browser can't show notifications"
        description="Use Chrome, Edge, Firefox or Safari, or install Skultem as an app." />
      <UAlert v-else-if="state === 'blocked'" color="warning" variant="subtle" icon="i-lucide-bell-off"
        title="Notifications are blocked for Skultem"
        description="Allow them in your browser or phone settings for this site, then come back and turn them on." />
      <UAlert v-else-if="state === 'server-off'" color="neutral" variant="subtle" icon="i-lucide-bell-off"
        title="Not available yet" description="Device notifications aren't set up on this server." />

      <div v-if="state === 'on' || state === 'off'" class="flex flex-wrap gap-2">
        <UButton v-if="state === 'off'" icon="i-lucide-bell-ring" label="Turn on notifications" :loading="busy"
          @click="turnOn" />
        <template v-else>
          <UButton icon="i-lucide-send" variant="soft" label="Send a test" :loading="testing" @click="test" />
          <UButton icon="i-lucide-bell-off" color="neutral" variant="ghost" label="Turn off on this device"
            :loading="busy" @click="turnOff" />
        </template>
      </div>
      <p v-if="state === 'on'" class="text-xs text-muted">
        On for this device only. Turn them on separately on your other phones or computers.
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
type PushBadge = { label: string, color: 'success' | 'neutral' | 'warning', icon: string }

const { state, busy, refresh, enable, disable } = usePushNotifications()
const { success, error: toastError } = useNotify()
const testing = ref(false)

const badge = computed<PushBadge>(() => state.value === 'on'
  ? { label: 'On', color: 'success', icon: 'i-lucide-bell-ring' }
  : state.value === 'blocked'
    ? { label: 'Blocked', color: 'warning', icon: 'i-lucide-bell-off' }
    : { label: 'Off', color: 'neutral', icon: 'i-lucide-bell-off' })

async function turnOn() {
  try {
    const result = await enable()
    if (result === 'on') success('Notifications are on for this device')
  } catch (err: any) {
    toastError(err?.message || 'Could not turn on notifications')
  }
}

async function turnOff() {
  await disable()
  success('Notifications are off for this device')
}

async function test() {
  testing.value = true
  try {
    const devices = await PushApi().sendTest()
    if (devices) success(`Test sent to ${devices} ${devices === 1 ? 'device' : 'devices'}. Close or hide Skultem to see it pop up.`)
    else toastError('No device received it. Turn notifications off and on again.')
  } catch (err: any) {
    toastError(err?.message || 'Could not send a test')
  } finally {
    testing.value = false
  }
}

onMounted(refresh)
</script>
