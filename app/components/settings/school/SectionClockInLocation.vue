<template>
  <div class="border-t border-default pt-5">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-sm font-medium text-highlighted">Staff clock-in location</p>
        <p class="text-xs text-muted">
          <template v-if="configured">Set - staff of {{ sectionName }} clock in within {{ form.radiusMeters }}m of this spot.</template>
          <template v-else>Not set - {{ sectionName }} staff clock in at the school-wide location until you set one.</template>
        </p>
      </div>
      <UButton :label="open ? 'Hide' : configured ? 'Edit' : 'Set location'" size="sm" variant="soft"
        color="neutral" :icon="open ? 'lucide:chevron-up' : 'lucide:map-pin'" @click="open = !open" />
    </div>

    <div v-if="open" class="mt-4 space-y-4">
      <ClientOnly>
        <SettingsAttendanceLocationMap ref="locationMap" v-model:latitude="form.latitude"
          v-model:longitude="form.longitude" :radius-meters="form.radiusMeters" :configured="configured" />
      </ClientOnly>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UFormField required label="Latitude">
          <UInput v-model.number="form.latitude" type="number" step="any" class="w-full" />
        </UFormField>
        <UFormField required label="Longitude">
          <UInput v-model.number="form.longitude" type="number" step="any" class="w-full" />
        </UFormField>
        <UFormField required label="Radius (metres)" help="How far from this spot staff can be and still clock in.">
          <UInput v-model.number="form.radiusMeters" type="number" min="10" class="w-full" />
        </UFormField>
        <UFormField label="Allowed IP addresses" help="Optional. Comma-separated IPs / ranges of this location's network.">
          <UInput v-model="form.allowedIps" placeholder="e.g. 41.66.12.5, 192.168.1.0/24" class="w-full" />
        </UFormField>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton variant="soft" icon="lucide:crosshair" :loading="locating" @click="useCurrentLocation">
          Use My Current Location
        </UButton>
        <UButton icon="lucide:save" :loading="saving" @click="save">Save location</UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// A management section's own geofence for staff clock-in (see ClockInLocationService): a school run
// from several places sets one per section. Same capture flow as the school-wide Attendance tab.
const props = defineProps<{
  sectionId: string
  sectionName: string
  initial?: AttendanceLocationSettings | null
}>()
const emit = defineEmits<{ saved: [AttendanceLocationSettings] }>()

const { success, error: toastError, warning } = useNotify()

const open = ref(false)
const saving = ref(false)
const locating = ref(false)
const configured = ref(!!props.initial?.configured)
const locationMap = ref<{ panTo: (lat: number, lng: number) => void } | null>(null)

const form = reactive({
  latitude: props.initial?.latitude ?? 0,
  longitude: props.initial?.longitude ?? 0,
  radiusMeters: props.initial?.radiusMeters ?? 150,
  allowedIps: props.initial?.allowedIps ?? ''
})

// Same poor-fix warning as the school-wide tab: a desktop's Wi-Fi/IP position can be hundreds of
// metres off while still reporting success.
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
      form.latitude = latitude
      form.longitude = longitude
      locationMap.value?.panTo(latitude, longitude)
      locating.value = false
      if (accuracy > POOR_ACCURACY_THRESHOLD_METERS) {
        warning(`Location captured, but accuracy is poor (±${Math.round(accuracy)}m) - try again on a phone outdoors before saving.`)
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

async function save() {
  saving.value = true
  try {
    const res = await TeacherAttendanceApi().saveSectionLocationSettings(props.sectionId, {
      latitude: form.latitude,
      longitude: form.longitude,
      radiusMeters: form.radiusMeters,
      allowedIps: form.allowedIps || undefined
    })
    if (!res) return
    configured.value = true
    success(`${props.sectionName} clock-in location saved`)
    emit('saved', res)
  } catch (err: any) {
    toastError(err?.message || 'Failed to save the clock-in location')
  } finally {
    saving.value = false
  }
}
</script>
