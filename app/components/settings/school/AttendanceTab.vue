<template>
  <template v-if="loadingLocation">
    <UCard>
      <template #header>
        <USkeleton class="h-4 w-32" />
      </template>
      <USkeleton class="h-72 w-full rounded-lg sm:h-96" />
      <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <USkeleton class="h-9 w-full rounded-lg" />
        <USkeleton class="h-9 w-full rounded-lg" />
      </div>
      <USkeleton class="mt-4 h-9 w-56 rounded-lg" />
    </UCard>

    <UCard>
      <template #header>
        <USkeleton class="h-4 w-28" />
      </template>
      <USkeleton class="h-9 w-full rounded-lg" />
    </UCard>

    <UCard>
      <template #header>
        <USkeleton class="h-4 w-40" />
      </template>
      <USkeleton class="h-16 w-full rounded-lg" />
    </UCard>
  </template>

  <template v-else>
    <!-- Clock-in location, radius and network belong to Staff & HR; the alert threshold below is core. -->
    <template v-if="hrInstalled">
    <UAlert v-if="isSectionBased" color="info" variant="subtle" icon="lucide:map-pin"
      title="Each section can have its own clock-in location"
      description="This is the school-wide location. Staff limited to a section clock in at that section's own location (set under Section Branding); staff not limited to any section can clock in at any of them. This one is used by sections that haven't set their own." />
    <UAlert v-if="!locationConfigured" color="warning" variant="subtle" icon="lucide:triangle-alert"
      title="Not set up yet" description="Teachers can't clock in until a location is picked on the map and saved here." />
    <UCard>
      <template #header>
        <p>Clock-In Location</p>
      </template>

      <ClientOnly>
        <SettingsAttendanceLocationMap ref="locationMap" v-model:latitude="state.latitude"
          v-model:longitude="state.longitude" :radius-meters="state.radiusMeters" :configured="locationConfigured" />
        <template #fallback>
          <div class="flex h-72 items-center justify-center rounded-lg border border-default sm:h-96">
            <UIcon name="i-lucide-loader-circle" class="animate-spin text-2xl text-muted" />
          </div>
        </template>
      </ClientOnly>

      <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UFormField required label="Latitude">
          <UInput v-model.number="state.latitude" type="number" step="any" class="w-full" />
        </UFormField>

        <UFormField required label="Longitude">
          <UInput v-model.number="state.longitude" type="number" step="any" class="w-full" />
        </UFormField>
      </div>

      <UButton class="mt-4" variant="soft" icon="lucide:crosshair" :loading="locating" @click="useCurrentLocation">
        Use My Current Location
      </UButton>
      <p class="mt-2 text-xs text-muted">Search for the address, click the map, or drag the pin
        to set the school's location - or press this button while standing there.</p>
    </UCard>

    <UCard>
      <template #header>
        <p>Allowed Radius</p>
      </template>
      <UFormField required label="Radius (metres)"
        help="How far from the school a teacher can be and still clock in. Shown as the shaded circle on the map above.">
        <UInput v-model.number="state.radiusMeters" type="number" min="10" class="w-full" />
      </UFormField>
    </UCard>

    <UCard>
      <template #header>
        <p>Network Restriction</p>
      </template>
      <UFormField label="Allowed IP Addresses"
        help="Comma-separated IPs and/or ranges (e.g. 41.66.12.5, 192.168.1.0/24). Leave blank to skip this check - location alone will decide.">
        <UTextarea v-model="state.allowedIps" :rows="2" placeholder="e.g. 41.66.12.5, 192.168.1.0/24"
          class="w-full" />
      </UFormField>

      <p class="mt-3 flex items-start gap-1.5 text-xs text-muted">
        <UIcon name="lucide:info" class="mt-0.5 size-3.5 shrink-0" />
        When set, a clock-in must come from the school's own network as well as be within range
        - a second layer against someone clocking in for a colleague from elsewhere.
      </p>
    </UCard>
    </template>

    <UCard>
      <template #header>
        <p>Attendance Alert Threshold</p>
      </template>
      <UFormField label="Minimum Attendance %"
        help="Students below this attendance percentage are flagged as 'needs attention' across the class view, student profile and attendance reports.">
        <UInput v-model.number="attendanceThresholdModel" type="number" min="0" max="100" step="0.1"
          class="w-full" />
      </UFormField>
    </UCard>

    <UCard>
      <template #header>
        <p>How "Needs Attention" Judges Attendance</p>
      </template>
      <div class="grid grid-cols-1 gap-4">
        <UFormField label="Days to look back"
          help="How many of a student's most recent school days we look at (weekends and holidays don't count). 20 is about four weeks. When a student starts coming to school again, they come off the list once those recent days look good.">
          <UInput v-model.number="rules.attendanceWindowDays" type="number" min="5" max="60" class="w-full" />
        </UFormField>

        <UFormField label="Minimum marked days"
          help="A student needs at least this many marked days before they can be flagged. This stops a new student, or the first week of a term, from being flagged after one or two absences.">
          <UInput v-model.number="rules.attendanceMinDays" type="number" min="1" :max="rules.attendanceWindowDays"
            class="w-full" />
        </UFormField>

        <UFormField label="Absent days in a row"
          help="If a student is absent this many school days in a row, they are marked Critical straight away, even if their overall attendance is still good.">
          <UInput v-model.number="rules.attendanceStreakDays" type="number" min="2" max="10" class="w-full" />
        </UFormField>
      </div>
      <p class="mt-3 flex items-start gap-1.5 text-xs text-muted">
        <UIcon name="lucide:info" class="mt-0.5 size-3.5 shrink-0" />
        Together with the minimum attendance % above, these decide which students show as Watch, Needs attention
        or Critical on the class page and in reports.
      </p>
    </UCard>
  </template>
</template>

<script setup lang="ts">
const props = defineProps<{
  state: {
    latitude: number
    longitude: number
    radiusMeters: number
    allowedIps: string
  }
  rules: {
    attendanceWindowDays: number
    attendanceMinDays: number
    attendanceStreakDays: number
  }
  loadingLocation: boolean
  locationConfigured: boolean
  attendanceThreshold: number
}>()

const emit = defineEmits<{
  'update:attendanceThreshold': [value: number]
}>()

const attendanceThresholdModel = computed({
  get: () => props.attendanceThreshold,
  set: (value: number) => emit('update:attendanceThreshold', value)
})

const { success, error: toastError, warning } = useNotify()
const { isInstalled } = useModules()
const hrInstalled = computed(() => isInstalled(ModuleKey.STAFF_HR))
const { isSectionBased } = useSchoolStructure()

const locating = ref(false)
const locationMap = ref<{ panTo: (lat: number, lng: number) => void } | null>(null)

const POOR_ACCURACY_THRESHOLD_METERS = 200

function useCurrentLocation() {
  if (!navigator.geolocation) {
    toastError('Your browser does not support location services.')
    return
  }

  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords
      props.state.latitude = latitude
      props.state.longitude = longitude
      locationMap.value?.panTo(latitude, longitude)
      locating.value = false

      if (accuracy > POOR_ACCURACY_THRESHOLD_METERS) {
        warning(`Location captured, but accuracy is poor (±${Math.round(accuracy)}m) - this is `
          + 'common on desktops/laptops without GPS. Before saving, try again on a phone outdoors '
          + 'or with a clear view of the sky, then check the pin lands on the right spot.')
      } else {
        success(`Location captured (±${Math.round(accuracy)}m accuracy).`)
      }
    },
    (err) => {
      locating.value = false
      toastError(err.code === 1 ? 'Location access was denied.' : 'Unable to determine your location.')
    },
    { enableHighAccuracy: true, timeout: 15000 }
  )
}
</script>
