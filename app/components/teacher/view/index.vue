<template>
    <div class="space-y-4 px-4 md:px-5">
        <!-- Profile banner -->
        <UCard :ui="{
            body: 'p-0 sm:p-0'
        }" class="overflow-hidden">
            <!-- Cover -->
            <div
                class="h-20 bg-linear-to-br from-primary/15 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 md:h-24" />

            <div class="px-5 pb-5">
                <div class="-mt-12 flex flex-col gap-5 md:-mt-14 md:flex-row md:items-end md:justify-between">
                    <!-- Teacher identity -->
                    <div class="flex min-w-0 items-end gap-4">
                        <!-- Avatar -->
                        <div
                            class="relative shrink-0 rounded-2xl bg-default p-1.5 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                            <USkeleton v-if="loading" class="h-20 w-20 rounded-xl md:h-24 md:w-24" />

                            <template v-else>
                                <UAvatar :src="record?.user?.photo || undefined" :alt="name" size="3xl"
                                    class="h-20 w-20 rounded-xl md:h-24 md:w-24"
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

                            <!-- Staff ID + Status -->
                            <div v-if="loading" class="mt-2 flex items-center gap-2">
                                <USkeleton class="h-4 w-28" />
                                <USkeleton class="h-5 w-14 rounded-full" />
                            </div>

                            <div v-else class="mt-2 flex flex-wrap items-center gap-2">
                                <span class="text-sm text-muted">
                                    {{ record?.staffId || 'No staff ID' }}
                                </span>

                                <span class="size-1 rounded-full bg-dimmed" />

                                <UBadge :color="statusColor" variant="subtle" size="xs" class="rounded-full">
                                    <span class="mr-0.5 size-1.5 rounded-full" :class="`bg-${statusColor}`" />
                                    {{ clean(record?.status || '') }}
                                </UBadge>
                            </div>

                            <!-- Email -->
                            <div v-if="!loading" class="mt-1.5 flex items-center gap-1.5 text-xs text-dimmed">
                                <UIcon name="i-lucide-mail" class="size-3.5" />
                                <span class="font-medium text-muted">
                                    {{ record?.user?.email || 'No email' }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="flex shrink-0 items-center gap-2">
                        <UButton v-if="record && !loading" :to="`/teachers/edit/${record.id}`" size="sm" color="primary"
                            :icon="EDIT_ICON" label="Edit Teacher" />
                    </div>
                </div>

                <!-- Quick facts -->
                <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <div v-for="item in quickFacts" :key="item.label"
                        class="flex items-center gap-3 rounded-xl border border-default bg-elevated/40 px-3.5 py-3">
                        <div
                            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <UIcon :name="item.icon" class="size-4" />
                        </div>

                        <div class="min-w-0">
                            <p class="text-xs text-muted">
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
const store = useTeacherStore()

const { record, loading } = storeToRefs(store)
const route = useRoute()

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})

const name = computed(() => {
    if (!record.value) return ''

    return `${clean(record.value.title)} ${record.value.user?.givenNames} ${record.value.user?.familyName}`.trim()
})

const statusColor = computed(() => {
    switch (record.value?.status) {
        case 'ACTIVE':
            return 'success'
        case 'INACTIVE':
            return 'warning'
        default:
            return 'error'
    }
})

const quickFacts = computed(() => [
    {
        label: 'Designation',
        value: record.value?.designation || '—',
        icon: 'i-lucide-briefcase'
    },
    {
        label: 'Phone',
        value: record.value?.phone || '—',
        icon: 'i-lucide-phone'
    },
    {
        label: 'Gender',
        value: clean(record.value?.gender || '') || '—',
        icon: 'i-lucide-user'
    },
    {
        label: 'City',
        value: record.value?.city || '—',
        icon: 'i-lucide-map-pinned'
    },
    {
        label: 'Classes',
        value: record.value?.classes?.length ? record.value.classes.join(', ') : 'None assigned',
        icon: 'i-lucide-school'
    }
])

const uploadingPhoto = ref(false)

async function onPhotoChange(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''

    if (!file || !record.value?.user) return

    if (file.size > 2 * 1024 * 1024) {
        useNotify().error('Photo must be 2MB or less')
        return
    }

    uploadingPhoto.value = true

    try {
        const res = await useUserStore().updatePhoto(record.value.user.id, file)
        if (res && record.value?.user) record.value.user.photo = res.photo
        useNotify().success('Photo updated')
    } catch (err: any) {
        useNotify().error(err?.message || 'Failed to upload photo')
    } finally {
        uploadingPhoto.value = false
    }
}

const profileInfo = `/teachers/${route.params.id}`
const subjectsInfo = `/teachers/${route.params.id}/subjects`
const curriculumInfo = `/teachers/${route.params.id}/curriculum`
const attendanceInfo = `/teachers/${route.params.id}/attendance`

// Subjects/Curriculum only apply to classroom teachers - hidden for non-teaching staff (Add
// Staff, or a User account opted into payroll). Defaults true while the record is still loading
// so the tabs don't flash in and back out once it arrives.
const isTeaching = computed(() => record.value?.teaching !== false)

const mobileTabs = computed(() => [
    { label: 'Profile', to: profileInfo, exact: true },
    ...(isTeaching.value ? [{ label: 'Subjects', to: subjectsInfo, exact: true }] : []),
    { label: 'Attendance', to: attendanceInfo, exact: true },
    ...(isTeaching.value ? [{ label: 'Curriculum', to: curriculumInfo, exact: true }] : [])
])

const desktopTabs = computed(() => [
    { label: 'Profile Information', to: profileInfo, exact: true },
    ...(isTeaching.value ? [{ label: 'Subjects & Classes', to: subjectsInfo, exact: true }] : []),
    { label: 'Attendance', to: attendanceInfo, exact: true },
    ...(isTeaching.value ? [{ label: 'Curriculum Progress', to: curriculumInfo, exact: true }] : [])
])

async function fetchTeacher() {
    await store.viewTeacher(route.params.id as string)
}

watch(
    () => route.params.id,
    () => {
        fetchTeacher()
    },
    {
        immediate: true
    }
)
</script>
