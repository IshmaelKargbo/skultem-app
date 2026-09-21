<template>
    <div class="min-h-full space-y-4 px-4 md:px-6">
        <!-- Profile banner -->
        <UCard :ui="{
            body: 'p-0 sm:p-0'
        }" class="overflow-hidden">
            <!-- Cover -->
            <div
                class="h-20 bg-linear-to-br from-primary/15 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 md:h-24" />

            <div class="px-5 pb-5">
                <div class="-mt-12 flex flex-col gap-2 md:-mt-14 md:flex-row md:justify-between">
                    <!-- Student Identity -->
                    <div class="flex flex-col md:flex-row items-center min-w-0 gap-4">
                        <!-- Avatar -->
                        <div
                            class="relative shrink-0 rounded-2xl bg-default p-1.5 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                            <USkeleton v-if="loading" class="h-20 w-20 rounded-xl md:h-24 md:w-24" />

                            <template v-else>
                                <img :src="photo" :alt="name" class="h-20 w-20 rounded-xl object-cover md:h-24 md:w-24"
                                    :class="{ 'opacity-50': uploadingPhoto }" />

                                <div v-if="uploadingPhoto"
                                    class="absolute inset-1.5 flex items-center justify-center rounded-xl">
                                    <UIcon name="i-lucide-loader-circle" class="animate-spin text-lg text-primary" />
                                </div>

                                <UTooltip v-else :delay-duration="0" arrow text="Upload photo">
                                    <label
                                        class="absolute -bottom-1 -right-1 flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-default bg-primary text-white shadow-md hover:bg-primary-600">
                                        <UIcon name="i-lucide-camera" class="size-3.5" />
                                        <input class="hidden" type="file" accept="image/png,image/jpeg,image/jpg"
                                            @change="onPhotoChange">
                                    </label>
                                </UTooltip>
                            </template>
                        </div>

                        <!-- Identity -->
                        <div
                            class="min-w-0 pb-0.5 md:pb-1 flex flex-col justify-center md:justify-baseline md:items-start items-center">
                            <!-- Name -->
                            <USkeleton v-if="loading" class="h-6 w-48 md:h-7 md:w-60" />

                            <h2 v-else
                                class="truncate text-xl font-bold tracking-tight text-highlighted md:max-w-md md:text-2xl">
                                {{ name }}
                            </h2>

                            <!-- Class + Status -->
                            <div v-if="loading" class="mt-1 flex items-center gap-2">
                                <USkeleton class="h-4 w-28" />
                                <USkeleton class="h-5 w-14 rounded-full" />
                            </div>

                            <div v-else class="mt-1 flex flex-wrap items-center gap-2">
                                <UTooltip v-if="attentionReason" :delay-duration="0" arrow :text="attentionReason">
                                    <UBadge color="warning" variant="subtle" size="xs" class="rounded-full"
                                        icon="i-lucide-alert-triangle">
                                        Needs Attention
                                    </UBadge>
                                </UTooltip>
                            </div>

                            <!-- Admission -->
                            <div v-if="!loading"
                                class="mt-1 flex items-center justify-center flex-wrap gap-1.5 text-xs text-dimmed">
                                <p>{{ record?.admissionNumber || 'Not assigned' }}</p>
                                <div class="flex space-x-2">
                                    <p>-</p>
                                    <p>{{ record?.className || 'No class assigned' }}</p>
                                </div>
                                <div class="flex space-x-2">
                                    <p>-</p>
                                    <p>{{ clean(record?.gender || '') }}</p>
                                </div>
                                <div class="flex space-x-2">
                                    <p>-</p>
                                    <p>{{ clean(record?.nationality || '') }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex shrink-0 items-center gap-2 justify-center">
                        <StudentChangeClass v-if="record && !loading && canChangeClass" :student-id="record.id"
                            :student-name="name" />
                        <UButton v-if="record && !loading" :to="`/students/${record.id}/edit`" size="sm" color="primary"
                            :icon="EDIT_ICON" label="Edit Student" />
                    </div>
                </div>
            </div>
        </UCard>

        <!-- Mobile tabs -->
        <TabMobile class="md:hidden" :tabs="mobileTabs" />

        <!-- Desktop tabs -->
        <Tab class="hidden md:block" :tabs="desktopTabs" />

        <!-- Page content -->
        <div class="min-w-0">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
const store = useStudentStore()

const { record, loading } = storeToRefs(store)
const route = useRoute()
const { can } = useAuth()

// Report cards are ADMIN/OWNER/PROPRIETOR only server-side - Accountant can view a student's
// profile but not their report cards, so the tab only shows for roles that can actually open it.
const { isPathAvailable } = useModules()
const canViewReportCards = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]))
// Matches PATCH /enrollment/{id}/class, which only ADMIN/OWNER/PROPRIETOR may call.
const canChangeClass = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]))

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})

const name = computed(() => {
    if (!record.value) return ''

    return `${record.value.givenNames} ${record.value.familyName}`
})

const photo = computed(() => {
    return record.value?.photo || '/avatar-placeholder.svg'
})

const uploadingPhoto = ref(false)

async function onPhotoChange(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''

    if (!file || !record.value) return

    if (file.size > 2 * 1024 * 1024) {
        useNotify().error('Photo must be 2MB or less')
        return
    }

    uploadingPhoto.value = true

    try {
        await store.updatePhoto(record.value.id, file)
        useNotify().success('Photo updated')
    } catch (err: any) {
        useNotify().error(err?.message || 'Failed to upload photo')
    } finally {
        uploadingPhoto.value = false
    }
}

const quickFacts = computed(() => [
    {
        label: 'Nationality',
        value: clean(record.value?.nationality || '') || '—',
        icon: 'i-lucide-globe-2'
    },
    {
        label: 'Gender',
        value: clean(record.value?.gender || '') || '—',
        icon: 'i-lucide-user'
    }
])

const backQuery = typeof route.query.back === 'string' && route.query.back ? `?back=${route.query.back}` : ''

const personalInfo = `/students/${route.params.id}${backQuery}`
const attendanceInfo = `/students/${route.params.id}/attendance${backQuery}`
const feeStructureInfo = `/students/${route.params.id}/fee-structure${backQuery}`
const performanceInfo = `/students/${route.params.id}/performance${backQuery}`
const academicInfo = `/students/${route.params.id}/academic-information${backQuery}`
const behavioursInfo = `/students/${route.params.id}/behaviours${backQuery}`
const reportCardInfo = `/students/${route.params.id}/report-card${backQuery}`

// Ordered by importance: who they are, their academic placement, how they're performing
// (performance + the report card that summarizes it, kept together), then attendance,
// fees and behaviours - all real but secondary to the academic picture.
const mobileTabs = computed(() => [
    { label: 'Personal', to: personalInfo, icon: USER_ICON, exact: true },
    { label: 'Academics', to: academicInfo, icon: ACADEMIC_ICON, exact: true },
    { label: 'Performance', to: performanceInfo, icon: PERFORMANCE_ICON, exact: true },
    ...(canViewReportCards.value ? [{ label: 'Report Card', to: reportCardInfo, icon: REPORT_CARD_ICON, exact: true }] : []),
    { label: 'Attendance', to: attendanceInfo, icon: ATTENDANCE_ICON, exact: true },
    { label: 'Fees', to: feeStructureInfo, icon: STUDENT_FEES_ICON, exact: true },
    { label: 'Behaviours', to: behavioursInfo, icon: BEHAVIOUR_ICON, exact: true }
    // Tabs for a module this school hasn't installed (Grading, Report Cards, Behaviour) drop out.
].filter((tab) => isPathAvailable(tab.to)))

const desktopTabs = computed(() => [
    { label: 'Personal Information', to: personalInfo, icon: USER_ICON, exact: true },
    { label: 'Academic Information', to: academicInfo, icon: ACADEMIC_ICON, exact: true },
    { label: 'Performance', to: performanceInfo, icon: PERFORMANCE_ICON, exact: true },
    ...(canViewReportCards.value ? [{ label: 'Report Card', to: reportCardInfo, icon: REPORT_CARD_ICON, exact: true }] : []),
    { label: 'Attendance', to: attendanceInfo, icon: ATTENDANCE_ICON, exact: true },
    { label: 'Fee Structure', to: feeStructureInfo, icon: STUDENT_FEES_ICON, exact: true },
    { label: 'Behaviours', to: behavioursInfo, icon: BEHAVIOUR_ICON, exact: true }
].filter((tab) => isPathAvailable(tab.to)))

async function fetchStudent() {
    await store.viewStudent(route.params.id as string)
}

watch(
    () => route.params.id,
    () => {
        fetchStudent()
    },
    {
        immediate: true
    }
)

const attentionReason = ref('')

watch(
    () => record.value?.classId,
    async (classId) => {
        attentionReason.value = ''
        if (!classId || !record.value?.id) return

        try {
            const res = await ClassApi().getAttention(classId)
            const flagged = res?.students?.find((s: StudentAttention) => s.studentId === record.value?.id)
            if (!flagged) return

            const parts: string[] = []
            if (flagged.attendanceFlag) parts.push(`Attendance ${flagged.attendanceRate}%`)
            if (flagged.academicFlag) parts.push(`Average ${flagged.academicAverage}%`)
            attentionReason.value = parts.join(' · ')
        } catch (err) {
            console.error('Failed to load student attention status', err)
        }
    },
    { immediate: true }
)
</script>
