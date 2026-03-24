<script lang="ts" setup>
const typeColor: Record<string, string> = {
    "NEW FEATURE": "bg-blue-600",
    "UPDATE": "bg-green-600",
    "MAINTENANCE": "bg-yellow-500",
    "ANNOUNCEMENT": "bg-purple-600"
}

const items = ref([
    {
        type: "NEW FEATURE",
        title: "Attendance reports are here",
        message: "Download detailed monthly attendance summaries for each student directly from the dashboard."
    },
    {
        type: "UPDATE",
        title: "Improved Leaderboard",
        message: "Student rankings now update instantly when assessments are approved."
    },
    {
        type: "ANNOUNCEMENT",
        title: "Parent Notifications",
        message: "Parents will now receive alerts when new grades are published."
    },
    {
        type: "MAINTENANCE",
        title: "System Upgrade",
        message: "The platform will undergo scheduled maintenance this Saturday at 10PM."
    }
])

const visible = ref(true)
const active = ref(0)

let timer: any

onMounted(() => {
    timer = setInterval(() => {
        active.value = (active.value + 1) % items.value.length
    }, 4000) // slide every 4 seconds
})

onUnmounted(() => {
    clearInterval(timer)
})
</script>
<template>
    <Transition name="fade">
        <UCarousel :autoplay="{ delay: 10000 }" v-slot="{ item }" :items="items" class="w-full">
            <div class="w-full h-28 bg-primary-900 border-primary-800 border-2 rounded-lg space-y-3 flex p-2 pb-0 flex-col">
                <!-- header -->
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full shrink-0" :class="typeColor[item.type]" />
                        <p class="text-[10px] font-semibold pt-0.5 tracking-widest text-muted uppercase leading-none">
                            {{ item.type }}
                        </p>
                    </div>
                </div>
                <!-- body -->
                <div class="space-y-1 flex-1 min-h-0">
                    <p class="text-[11.5px] font-semibold leading-snug line-clamp-1">{{ item.title }}</p>
                    <p class="text-[11px] text-muted leading-relaxed line-clamp-4">{{ item.message }}</p>
                </div>
            </div>
        </UCarousel>
    </Transition>
</template>

<style scoped>
.fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(6px);
}
</style>