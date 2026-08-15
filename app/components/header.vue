<template>
    <div class="px-4 pt-4 md:px-6">
        <UCard :ui="{ body: 'py-1.5 md:py-4' }">
            <div class="flex items-center gap-2 md:gap-3">
                <UButton v-if="back" :icon="BACK_ICON" color="neutral" variant="ghost" size="sm"
                    class="shrink-0 -ml-1" aria-label="Go back" @click="router.back()" />
                <MenuDrawer v-else class="md:hidden block shrink-0" />

                <div class="min-w-0 flex-1 pt-1 space-y-1">

                    <p v-if="title" class="min-w-0 truncate  font-display font-semibold transition-colors  sm:text-xl"
                        :class="isDark ? 'text-gray-100' : 'text-gray-900'">
                        {{ title }}
                    </p>
                    <USkeleton v-else class="h-4 w-44 max-w-full" />

                    <p class="text-sm text-muted">
                        2025/2026 Academic Session · Term 2 Active
                    </p>

                </div>

                <div class="flex shrink-0 items-center gap-1 sm:gap-2">
                    <!-- Live clock -->
                    <div class="hidden sm:flex flex-col items-end leading-tight border-r border-default pr-2.5 mr-0.5">
                        <span class="text-sm font-semibold tabular-nums text-toned">{{ time }}</span>
                        <span class="hidden text-[12px] text-muted md:block">{{ date }}</span>
                    </div>

                    <Notification />

                    <Me compact />
                </div>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const store = useAppStore()
const { title, back } = storeToRefs(store)

const router = useRouter()
const route = useRoute()

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

// Breadcrumb — one crumb per path segment, most specific last (labelled with
// the page's own title when available). Segments that look like ids
// (uuids/numeric ids) aren't meaningful to show raw, so they fall back to a
// generic label.
const crumbs = computed(() => {
    const segments = route.path.split('/').filter(Boolean)
    let acc = ''
    return segments.map((segment, i) => {
        acc += `/${segment}`
        const isLast = i === segments.length - 1
        return {
            to: acc,
            label: isLast && title.value ? title.value : formatSegment(segment)
        }
    })
})

function formatSegment(segment: string) {
    if (/^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment)) return 'Details'
    return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

// Live clock — the app runs with ssr disabled, so there's no hydration
// mismatch to guard against here.
const now = ref(new Date())
let timer: ReturnType<typeof setInterval>

onMounted(() => {
    timer = setInterval(() => { now.value = new Date() }, 1000)
})

onUnmounted(() => clearInterval(timer))

const time = computed(() => now.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
const date = computed(() => now.value.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }))
</script>
