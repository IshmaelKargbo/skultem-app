<template>
  <div class="space-y-4 px-4 md:px-6">
    <!-- LOADING -->
    <UCard v-if="loadingMyToday">
      <div class="flex items-center gap-3">
        <USkeleton class="size-10 shrink-0 rounded-xl" />
        <div class="min-w-0 flex-1 space-y-2">
          <USkeleton class="h-4 w-40" />
          <USkeleton class="h-3 w-56" />
        </div>
      </div>
    </UCard>

    <template v-else>
      <UCard :ui="{ body: 'space-y-5' }">
        <div class="flex items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl" :class="stateIconBg">
            <UIcon :name="stateIcon" class="size-5" :class="stateIconColor" />
          </div>

          <div class="min-w-0 flex-1">
            <p class="truncate font-semibold text-highlighted">{{ stateTitle }}</p>
            <p class="text-sm text-muted">{{ stateSubtitle }}</p>
          </div>

          <UBadge v-if="myToday?.status" :color="teacherAttendanceStatusColor(myToday.status)" variant="subtle" class="shrink-0">
            {{ clean(myToday.status) }}
          </UBadge>
        </div>

        <template v-if="myToday?.clockedInAt">
          <USeparator />

          <div class="grid gap-3" :class="myToday?.clockedOutAt ? 'sm:grid-cols-2' : ''">
            <div class="flex items-center gap-3 rounded-xl border border-default bg-elevated/40 px-3.5 py-3">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UIcon name="i-lucide-log-in" class="size-4" />
              </div>
              <div class="min-w-0">
                <p class="text-xs text-muted">Clocked In</p>
                <p class="text-sm font-semibold text-highlighted">{{ formatTime(myToday.clockedInAt) }}</p>
              </div>
            </div>

            <div v-if="myToday?.clockedOutAt" class="flex items-center gap-3 rounded-xl border border-default bg-elevated/40 px-3.5 py-3">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <UIcon name="i-lucide-log-out" class="size-4" />
              </div>
              <div class="min-w-0">
                <p class="text-xs text-muted">Clocked Out</p>
                <p class="text-sm font-semibold text-highlighted">{{ formatTime(myToday.clockedOutAt) }}</p>
              </div>
            </div>
          </div>
        </template>

        <UButton
          v-if="!myToday?.clockedInAt" block size="lg" icon="i-lucide-log-in"
          :loading="locating || clockingIn" @click="onClockIn"
        >
          {{ locating ? 'Locating…' : clockingIn ? 'Clocking in…' : 'Clock In' }}
        </UButton>

        <UButton
          v-else-if="!myToday?.clockedOutAt" block size="lg" color="neutral" icon="i-lucide-log-out"
          :loading="locating || clockingOut" @click="onClockOut"
        >
          {{ locating ? 'Locating…' : clockingOut ? 'Clocking out…' : 'Clock Out' }}
        </UButton>
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

const lastError = ref('')
const lastErrorTitle = ref("Couldn't clock in")
const locating = ref(false)

const dayComplete = computed(() => !!(myToday.value?.clockedInAt && myToday.value?.clockedOutAt))
const clockedInOnly = computed(() => !!(myToday.value?.clockedInAt && !myToday.value?.clockedOutAt))

const stateIcon = computed(() => {
  if (dayComplete.value) return 'i-lucide-check-check'
  if (clockedInOnly.value) return 'i-lucide-check'
  return 'i-lucide-map-pin'
})

const stateIconBg = computed(() => dayComplete.value ? 'bg-success/10' : 'bg-primary/10')
const stateIconColor = computed(() => dayComplete.value ? 'text-success' : 'text-primary')

const stateTitle = computed(() => {
  if (dayComplete.value) return 'Your day is complete'
  if (clockedInOnly.value) return `Clocked in at ${formatTime(myToday.value!.clockedInAt!)}`
  return "You haven't clocked in yet"
})

const stateSubtitle = computed(() => {
  if (dayComplete.value) return 'See you tomorrow.'
  if (clockedInOnly.value) return "Press below when you're ready to clock out."
  return 'Press the button below and allow location access when your browser asks.'
})

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

const { can } = useAuth()

onMounted(() => {
  useAppStore().setTitle('Clock In / Out')
  // Reached from the teacher's own dashboard widget - take them back there. Reached via
  // HR/payroll (admin, accountant, etc. checking a staff member) - back to payroll instead.
  useAppStore().setBack(can(Role.TEACHER) ? '/' : '/payroll')
  document.title = 'Clock In / Out | Skultem'

  store.fetchMyToday()
})

definePageMeta({
  role: [Role.ADMIN, Role.OWNER, Role.PROPRIETOR, Role.ACCOUNTANT, Role.TEACHER]
})
</script>
