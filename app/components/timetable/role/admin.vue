<template>
    <div class="space-y-4 p-4">
        <UCard>
            <Heading title="Class Timetables"
                subtitle="Configure and manage weekly timetables for classes and sections">
                <div class="flex items-center gap-3 w-72">
                    <USelectMenu placeholder="Select Class" v-model="grade" value-key="value" :items="list"
                        :loading="classLoading" />
                </div>
            </Heading>
        </UCard>

        <!-- Timetable -->
        <UCard v-if="session" :ui="{ body: 'p-0 sm:p-0' }">
            <template #header>
                <div class="flex items-center justify-between">

                    <div class="flex items-center gap-3">
                        <div class="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <UIcon name="i-lucide-calendar-days" class="size-5" />
                        </div>

                        <div>
                            <h2 class="font-semibold text-base">
                                {{ session?.clazz }} · {{ session?.sectionName }}
                            </h2>

                            <p class="text-sm text-muted">
                                {{ periods.length }} periods · {{ store.getDayRange }}
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <UButton :loading="breakLoading" icon="i-lucide-coffee" color="neutral" variant="outline"
                            @click="addBreak">
                            Add Break
                        </UButton>

                        <UButton :loading="lunchLoading" icon="i-lucide-coffee" color="neutral" variant="outline"
                            @click="addLunch">
                            Add Lunch
                        </UButton>

                        <UButton :loading="addLoading" icon="i-lucide-plus" @click="addPeriod">
                            Add Period
                        </UButton>

                    </div>
                </div>
            </template>

            <div class="overflow-x-auto">
                <TimetablePeriod is-admin />
            </div>
        </UCard>
        <UCard v-else>
            <div class="flex flex-col items-center justify-center py-20 text-center">
                <UIcon name="i-lucide-school" class="size-12 text-muted mb-3" />

                <h3 class="text-base font-semibold">
                    Select a class to continue
                </h3>

                <p class="text-sm text-muted mt-1">
                    Choose a class from the dropdown to view or create its timetable.
                </p>
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
const store = useTimetableStore()
const classStore = useClassSessionStore()
const { periods } = storeToRefs(store)
const { list, loading: classLoading } = storeToRefs(classStore)
const grade = ref()


const addLoading = ref(false)
const breakLoading = ref(false)
const lunchLoading = ref(false)

const session = computed(() => classStore.get(grade.value))

async function addPeriod() {
    addLoading.value = true
    await store.createPeriod({ session: session.value?.id || '' })
    addLoading.value = false
}

async function addBreak() {
    breakLoading.value = true
    await store.createBreak({ session: session.value?.id || '' })
    breakLoading.value = false
}

async function addLunch() {
    lunchLoading.value = true
    await store.createLunch({ session: session.value?.id || '' })
    lunchLoading.value = false
}

watch(() => grade.value, async (value: string) => {
    if (value) {
        await store.getTimetable(value)
        await useTeacherSubjectStore().allByClass(value)
    }
}, { immediate: true })

watch(() => list.value, () => {
    grade.value = list.value[0]?.value || ''
})

onMounted(async () => {
    document.title = 'Timetable | Skultem'
    await classStore.fetchAll(0, 0)
    await store.getWorkingDays()
    await store.searchRoom(0, 0)
})
</script>