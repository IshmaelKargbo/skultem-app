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
                <div class="-mt-12 flex flex-col gap-5 md:-mt-14 md:flex-row md:items-end md:justify-between">
                    <!-- Student Identity -->
                    <div class="flex min-w-0 items-end gap-4">
                        <!-- Avatar -->
                        <div
                            class="relative shrink-0 rounded-2xl bg-default p-1.5 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                            <USkeleton v-if="loading" class="h-20 w-20 rounded-xl md:h-24 md:w-24" />

                            <template v-else>
                                <img :src="photo" :alt="name"
                                    class="h-20 w-20 rounded-xl object-cover md:h-24 md:w-24"
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
                        <div class="min-w-0 pb-0.5 md:pb-1">
                            <!-- Name -->
                            <USkeleton v-if="loading" class="h-6 w-48 md:h-7 md:w-60" />

                            <h2 v-else
                                class="max-w-[calc(100vw-150px)] truncate text-xl font-bold tracking-tight text-highlighted md:max-w-md md:text-2xl">
                                {{ name }}
                            </h2>

                            <!-- Class + Status -->
                            <div v-if="loading" class="mt-2 flex items-center gap-2">
                                <USkeleton class="h-4 w-28" />
                                <USkeleton class="h-5 w-14 rounded-full" />
                            </div>

                            <div v-else class="mt-2 flex flex-wrap items-center gap-2">
                                <span class="text-sm text-muted">
                                    {{ record?.className || 'No class assigned' }}
                                </span>

                                <span class="size-1 rounded-full bg-dimmed" />

                                <UBadge color="success" variant="subtle" size="xs" class="rounded-full">
                                    <span class="mr-1.5 size-1.5 rounded-full bg-success" />
                                    Active
                                </UBadge>
                            </div>

                            <!-- Admission -->
                            <div v-if="!loading" class="mt-1.5 flex items-center gap-1.5 text-xs text-dimmed">
                                <UIcon name="i-lucide-id-card" class="size-3.5" />

                                <span>Admission</span>

                                <span class="font-medium text-muted">
                                    {{ record?.admissionNumber || 'Not assigned' }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex shrink-0 items-center gap-2">
                        <UButton to="/students" variant="outline" size="sm" color="neutral" icon="i-lucide-arrow-left"
                            label="Students" />

                        <UButton v-if="record && !loading" :to="`/students/${record.id}/edit`" size="sm" color="primary"
                            :icon="EDIT_ICON" label="Edit Student" />
                    </div>
                </div>

                <!-- Quick facts -->
                <div class="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <div v-for="item in quickFacts" :key="item.label"
                        class="flex items-center gap-3 rounded-xl border border-default bg-elevated/40 p-3">
                        <div
                            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <UIcon :name="item.icon" class="size-4" />
                        </div>

                        <div class="min-w-0">
                            <p class="text-xs-base text-muted">
                                {{ item.label }}
                            </p>

                            <USkeleton v-if="loading" class="mt-1 h-4 w-16" />

                            <p v-else class="truncate text-sm font-semibold text-highlighted">
                                {{ item.value }}
                            </p>
                        </div>
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
const canViewReportCards = computed(() => can([Role.ADMIN, Role.PROPRIETOR, Role.OWNER]))

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR]
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

const personalInfo = `/students/${route.params.id}`
const attendanceInfo = `/students/${route.params.id}/attendance`
const feeStructureInfo = `/students/${route.params.id}/fee-structure`
const academicInfo = `/students/${route.params.id}/academic-information`
const behavioursInfo = `/students/${route.params.id}/behaviours`
const reportCardInfo = `/students/${route.params.id}/report-card`

const mobileTabs = computed(() => [
    { label: 'Personal', to: personalInfo, exact: true },
    { label: 'Attendance', to: attendanceInfo, exact: true },
    { label: 'Fees', to: feeStructureInfo, exact: true },
    { label: 'Academics', to: academicInfo, exact: true },
    { label: 'Behaviours', to: behavioursInfo, exact: true },
    ...(canViewReportCards.value ? [{ label: 'Report Card', to: reportCardInfo, exact: true }] : [])
])

const desktopTabs = computed(() => [
    { label: 'Personal Information', to: personalInfo, exact: true },
    { label: 'Attendance', to: attendanceInfo, exact: true },
    { label: 'Fee Structure', to: feeStructureInfo, exact: true },
    { label: 'Academic Information', to: academicInfo, exact: true },
    { label: 'Behaviours', to: behavioursInfo, exact: true },
    ...(canViewReportCards.value ? [{ label: 'Report Card', to: reportCardInfo, exact: true }] : [])
])

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
</script>
