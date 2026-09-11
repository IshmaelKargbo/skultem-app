<template>
  <div v-if="loadingLocation" class="flex justify-center py-14">
    <UIcon name="i-lucide-loader-circle" class="animate-spin text-3xl text-muted" />
  </div>

  <template v-else>
    <UAlert v-if="!locationConfigured" color="warning" variant="subtle" icon="lucide:triangle-alert"
      title="Not set up yet" description="Teachers can't clock in until a location is saved here." />
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
</template>

<script setup lang="ts">
// `state` is the parent's own reactive attendance-form object, mutated directly via v-model (and,
// below, from the geolocation callback) - see components/settings/school/ProfileTab.vue for why
// this stays one object prop rather than one prop per field.
const props = defineProps<{
  state: {
    latitude: number
    longitude: number
    radiusMeters: number
    allowedIps: string
  }
  loadingLocation: boolean
  locationConfigured: boolean
}>()

const { success, error: toastError } = useNotify()

const locating = ref(false)
const locationMap = ref<{ panTo: (lat: number, lng: number) => void } | null>(null)

// Self-contained (doesn't need anything from the page beyond the state prop above) - browser
// geolocation, in-component only.
function useCurrentLocation() {
  if (!navigator.geolocation) {
    toastError('Your browser does not support location services.')
    return
  }

  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      props.state.latitude = position.coords.latitude
      props.state.longitude = position.coords.longitude
      locationMap.value?.panTo(position.coords.latitude, position.coords.longitude)
      locating.value = false
      success('Location captured.')
    },
    (err) => {
      locating.value = false
      toastError(err.code === 1 ? 'Location access was denied.' : 'Unable to determine your location.')
    },
    { enableHighAccuracy: true, timeout: 15000 }
  )
}
</script>
