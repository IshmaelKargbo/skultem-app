<template>
    <UCard :ui="{ body: 'space-y-4' }">
        <div class="flex items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-xl" :class="stateIconBg">
                <UIcon :name="stateIcon" class="size-5" :class="stateIconColor" />
            </div>

            <div class="min-w-0 flex-1">
                <p class="truncate font-semibold text-highlighted">{{ stateTitle }}</p>
                <p class="text-sm text-muted">{{ stateSubtitle }}</p>
            </div>

            <UBadge v-if="myToday?.status" :color="teacherAttendanceStatusColor(myToday.status)" variant="subtle"
                class="shrink-0">
                {{ clean(myToday.status) }}
            </UBadge>
        </div>

        <template v-if="myToday?.clockedInAt">
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

                <div v-if="myToday?.clockedOutAt"
                    class="flex items-center gap-3 rounded-xl border border-default bg-elevated/40 px-3.5 py-3">
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

        <div class="flex flex-wrap gap-2">
            <UButton v-if="!myToday?.clockedInAt" size="lg" icon="i-lucide-log-in" class="flex-1 justify-center"
                :loading="locating || clockingIn" @click="onClockIn">
                {{ locating ? 'Locating…' : clockingIn ? 'Clocking in…' : 'Clock In' }}
            </UButton>

            <UButton v-else-if="!myToday?.clockedOutAt" size="lg" color="neutral" icon="i-lucide-log-out"
                class="flex-1 justify-center" :loading="locating || clockingOut" @click="onClockOut">
                {{ locating ? 'Locating…' : clockingOut ? 'Clocking out…' : 'Clock Out' }}
            </UButton>

            <UButton to="/hr/teacher-attendance/clock-in" variant="soft" color="neutral" size="lg" icon="i-lucide-history"
                :class="dayComplete ? 'flex-1 justify-center' : ''" :label="dayComplete ? 'View Details' : ''"
                :square="!dayComplete" />
        </div>

        <UAlert v-if="lastError" color="error" variant="soft" icon="i-lucide-alert-circle" :title="lastErrorTitle"
            :description="lastError" />
    </UCard>
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
    if (clockedInOnly.value) return "Tap clock out when you're ready to leave."
    return 'Allow location access when your browser asks.'
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

onMounted(() => {
    if (!myToday.value && !loadingMyToday.value) store.fetchMyToday()
})
</script>
