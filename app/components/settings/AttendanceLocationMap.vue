<template>
  <div class="space-y-3">
    <!-- Address search - typing here is usually faster than hunting for the school on the map,
         but it only recentres the pin; nothing is saved until "Save Location" is pressed. -->
    <div class="relative">
      <UInput
        v-model="query"
        icon="lucide:search"
        placeholder="Search for the school's address or area…"
        :loading="searching"
        class="w-full"
        @keydown.enter.prevent="() => results[0] && pickResult(results[0])"
      />

      <div
        v-if="results.length"
        class="absolute z-[1000] mt-1 w-full overflow-hidden rounded-lg border border-default bg-default shadow-lg"
      >
        <button
          v-for="r in results" :key="r.place_id" type="button"
          class="block w-full truncate px-3 py-2 text-left text-sm hover:bg-elevated"
          @click="pickResult(r)"
        >
          {{ r.display_name }}
        </button>
      </div>
    </div>

    <div ref="mapEl" class="h-72 w-full overflow-hidden rounded-lg border border-default sm:h-96" />

    <div class="flex items-start gap-1.5 text-xs text-muted">
      <UIcon name="lucide:map-pin" class="mt-0.5 size-3.5 shrink-0" />
      <p>
        <template v-if="resolvingAddress">Looking up address…</template>
        <template v-else-if="currentAddress">{{ currentAddress }}</template>
        <template v-else>Click anywhere on the map, or drag the pin, to set the school's location. The shaded circle is the clock-in radius.</template>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css'

const props = defineProps<{
  latitude: number
  longitude: number
  radiusMeters: number
  configured: boolean
}>()

const emit = defineEmits<{
  'update:latitude': [value: number]
  'update:longitude': [value: number]
}>()

const mapEl = ref<HTMLElement>()
const query = ref('')
const results = ref<{ place_id: number, display_name: string, lat: string, lon: string }[]>([])
const searching = ref(false)
const currentAddress = ref('')
const resolvingAddress = ref(false)

// Freetown, Sierra Leone - a reasonable default centre for a first-time setup before any
// location has been saved, rather than opening on the middle of the ocean at (0, 0).
const DEFAULT_CENTER: [number, number] = [8.4657, -13.2317]

let map: any
let marker: any
let circle: any
let searchTimer: ReturnType<typeof setTimeout>
let addressTimer: ReturnType<typeof setTimeout>

// Custom pin instead of Leaflet's default marker - avoids the classic "broken icon" bundler
// issue (its default image URLs don't resolve once Vite rewrites asset paths) and matches the
// app's own primary colour rather than stock Leaflet blue.
function pinIcon(L: typeof import('leaflet')) {
  return L.divIcon({
    className: '',
    html: `<svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.7 23.3 0 15 0z" fill="var(--ui-primary, #1878c5)"/>
      <circle cx="15" cy="15" r="6" fill="white"/>
    </svg>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
  })
}

async function reverseGeocode(lat: number, lng: number) {
  resolvingAddress.value = true
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`)
    if (!res.ok) return
    const data = await res.json()
    currentAddress.value = data?.display_name || ''
  } catch {
    // Best-effort only - the map still works fine without a resolved address label.
  } finally {
    resolvingAddress.value = false
  }
}

function setPosition(lat: number, lng: number, opts: { pan?: boolean } = {}) {
  emit('update:latitude', lat)
  emit('update:longitude', lng)

  if (marker) marker.setLatLng([lat, lng])
  if (circle) circle.setLatLng([lat, lng])
  if (opts.pan && map) map.setView([lat, lng], Math.max(map.getZoom(), 16))

  clearTimeout(addressTimer)
  addressTimer = setTimeout(() => reverseGeocode(lat, lng), 400)
}

function pickResult(r: { display_name: string, lat: string, lon: string }) {
  results.value = []
  query.value = ''
  setPosition(parseFloat(r.lat), parseFloat(r.lon), { pan: true })
}

watch(query, (val) => {
  clearTimeout(searchTimer)
  if (!val || val.trim().length < 3) {
    results.value = []
    return
  }

  searchTimer = setTimeout(async () => {
    searching.value = true
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(val)}`)
      results.value = res.ok ? await res.json() : []
    } catch {
      results.value = []
    } finally {
      searching.value = false
    }
  }, 400)
})

// The radius slider/input lives outside this component (it's shared with the plain-number
// fields) - keep the circle in sync whenever it changes.
watch(() => props.radiusMeters, (radius) => {
  if (circle && radius > 0) circle.setRadius(radius)
})

// A manually-typed lat/lng (the plain number inputs next to the map) should move the pin too,
// without re-triggering the emit->prop->watch loop that setPosition() already covers for
// map-driven moves - guard on real drift, not floating point noise from that round-trip.
watch([() => props.latitude, () => props.longitude], ([lat, lng]) => {
  if (!marker) return
  const at = marker.getLatLng()
  if (Math.abs(at.lat - lat) > 1e-9 || Math.abs(at.lng - lng) > 1e-9) {
    marker.setLatLng([lat, lng])
    circle?.setLatLng([lat, lng])
  }
})

onMounted(async () => {
  const L = await import('leaflet')

  const start: [number, number] = props.configured ? [props.latitude, props.longitude] : DEFAULT_CENTER

  map = L.map(mapEl.value!, { zoomControl: true }).setView(start, props.configured ? 16 : 12)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map)

  circle = L.circle(start, {
    radius: props.radiusMeters || 150,
    color: 'var(--ui-primary, #1878c5)',
    fillColor: 'var(--ui-primary, #1878c5)',
    fillOpacity: 0.12,
    weight: 1.5,
  }).addTo(map)

  marker = L.marker(start, { icon: pinIcon(L), draggable: true }).addTo(map)

  marker.on('dragend', () => {
    const { lat, lng } = marker.getLatLng()
    setPosition(lat, lng)
  })

  map.on('click', (e: any) => {
    setPosition(e.latlng.lat, e.latlng.lng)
  })

  if (props.configured) reverseGeocode(props.latitude, props.longitude)

  // The map is inside a tab that may render at 0 width/height (a hidden panel) before the user
  // switches to it, or inside a slideover whose transition hasn't finished when Leaflet
  // measures its container - both leave it stuck showing only the top-left tile.
  requestAnimationFrame(() => map?.invalidateSize())
})

onBeforeUnmount(() => {
  clearTimeout(searchTimer)
  clearTimeout(addressTimer)
  map?.remove()
})

defineExpose({
  // The parent's "Use My Current Location" button needs to move the pin too, not just the
  // plain inputs, so it re-pans the map like a search result would.
  panTo: (lat: number, lng: number) => setPosition(lat, lng, { pan: true }),
})
</script>
