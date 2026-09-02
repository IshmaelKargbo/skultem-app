<template>
  <div class=" space-y-4 px-4 md:px-6">

    <Heading title="Clock In / Out" subtitle="You must be at the school to clock in or out." />

    <div v-if="loadingMyToday" class="flex justify-center py-10">
      <UIcon name="i-lucide-loader-circle" class="animate-spin text-3xl text-muted" />
    </div>

    <template v-else>
      <!-- Day complete: clocked in and out -->
      <UCard v-if="myToday?.clockedInAt && myToday?.clockedOutAt" class="overflow-hidden" :ui="{ body: 'p-0 sm:p-0' }">
        <div class="flex flex-col items-center gap-3 bg-success/10 p-10 text-center">
          <div class="grid size-16 place-items-center rounded-full bg-success/15">
            <UIcon name="i-lucide-check-check" class="size-8 text-success" />
          </div>
          <div>
            <p class="font-semibold">Your day is complete</p>
            <p class="text-sm text-muted">In at {{ formatTime(myToday.clockedInAt) }} · Out at {{ formatTime(myToday.clockedOutAt) }}</p>
          </div>
          <UBadge :color="teacherAttendanceStatusColor(myToday.status)" variant="soft">
            {{ clean(myToday.status) }}
          </UBadge>
        </div>
      </UCard>

      <!-- Clocked in, not yet out -->
      <UCard v-else-if="myToday?.clockedInAt" class="overflow-hidden" :ui="{ body: 'p-0 sm:p-0' }">
        <div class="flex flex-col items-center gap-4 bg-primary/5 p-10 text-center">
          <div class="grid size-16 place-items-center rounded-full bg-primary/10">
            <UIcon name="i-lucide-check" class="size-8 text-primary" />
          </div>

          <div>
            <p class="font-semibold">You clocked in at {{ formatTime(myToday.clockedInAt) }}</p>
            <p class="mt-1 text-sm text-muted">Press below when you're ready to clock out.</p>
          </div>

          <UBadge :color="teacherAttendanceStatusColor(myToday.status)" variant="soft">
            {{ clean(myToday.status) }}
          </UBadge>

          <UButton size="xl" color="neutral" icon="i-lucide-log-out" :loading="locating || clockingOut" class="px-8"
            @click="onClockOut">
            {{ locating ? 'Locating…' : clockingOut ? 'Clocking out…' : 'Clock Out' }}
          </UButton>
        </div>
      </UCard>

      <!-- Not yet clocked in -->
      <UCard v-else class="overflow-hidden" :ui="{ body: 'p-0 sm:p-0' }">
        <div class="flex flex-col items-center gap-4 p-10 text-center">
          <div class="grid size-16 place-items-center rounded-full bg-primary/10">
            <UIcon name="i-lucide-map-pin" class="size-8 text-primary" />
          </div>

          <div>
            <p class="font-semibold">You haven't clocked in yet</p>
            <p class="mt-1 text-sm text-muted">{{ statusMessage }}</p>
          </div>

          <UButton size="xl" icon="i-lucide-log-in" :loading="locating || clockingIn" class="px-8" @click="onClockIn">
            {{ locating ? 'Locating…' : clockingIn ? 'Clocking in…' : 'Clock In' }}
          </UButton>
        </div>
      </UCard>

      <UAlert v-if="lastError" color="error" variant="soft" icon="i-lucide-alert-circle"
        :title="lastErrorTitle" :description="lastError" />
    </template>

  </div>
</template>

<script setup lang="ts">
const store = useTeacherAttendanceStore()
const { myToday, loadingMyToday, clockingIn, clockingOut } = storeToRefs(store)
const notify = useNotify()

const statusMessage = 'Press the button below and allow location access when your browser asks.'
const lastError = ref('')
const lastErrorTitle = ref("Couldn't clock in")
const locating = ref(false)

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Your browser does not support location services.'))
      return
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    })
  })
}

async function withLocation(): Promise<GeolocationPosition | null> {
  locating.value = true
  try {
    return await getPosition()
  } catch (err: any) {
    lastError.value = err?.code === 1
      ? 'Location access was denied. Enable location permission for this site and try again.'
      : (err?.message || 'Unable to determine your location.')
    return null
  } finally {
    locating.value = false
  }
}

async function onClockIn() {
  lastError.value = ''
  lastErrorTitle.value = "Couldn't clock in"

  const position = await withLocation()
  if (!position) return

  try {
    const result = await store.clockIn(position.coords.latitude, position.coords.longitude)
    if (result?.alreadyClockedIn) {
      notify.info('You already clocked in today.')
    } else {
      notify.success(`Clocked in — you were about ${Math.round(result?.distanceMeters || 0)}m from school.`)
    }
  } catch (err: any) {
    lastError.value = err?.message || 'Unable to clock in.'
  }
}

async function onClockOut() {
  lastError.value = ''
  lastErrorTitle.value = "Couldn't clock out"

  const position = await withLocation()
  if (!position) return

  try {
    const result = await store.clockOut(position.coords.latitude, position.coords.longitude)
    if (result?.alreadyClockedOut) {
      notify.info('You already clocked out today.')
    } else {
      notify.success(`Clocked out — you were about ${Math.round(result?.distanceMeters || 0)}m from school.`)
    }
  } catch (err: any) {
    lastError.value = err?.message || 'Unable to clock out.'
  }
}

onMounted(() => {
  useAppStore().setTitle('Clock In / Out')
  useAppStore().setBack('/payroll')
  document.title = 'Clock In / Out | Skultem'

  store.fetchMyToday()
})

definePageMeta({
  role: [Role.TEACHER]
})
</script>
