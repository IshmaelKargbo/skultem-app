<template>
    <StudentView>
        <UCard class="overflow-hidden">
            <template #header>
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-user" class="size-5 text-primary" />
                        <h3 class="md:text-lg font-semibold">
                            Student Information
                        </h3>
                    </div>

                    <p class="text-xs-base text-muted">
                        Personal details and contact information.
                    </p>
                </div>
            </template>

            <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div v-for="i in 8" :key="i" class="rounded-2xl border border-default p-4 space-y-3 bg-gray-100 dark:bg-neutral-800">
                    <USkeleton class="h-3 w-20" />
                    <USkeleton class="h-5 w-32" />
                </div>
            </div>

            <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div
                    v-for="item in personalDetails"
                    :key="item.label"
                    class="rounded-2xl border border-default bg-gray-100 p-4 transition hover:border-primary/40 dark:bg-neutral-800"
                >
                    <div class="flex items-center gap-2 text-muted">
                        <UIcon :name="item.icon" class="size-4" />
                        <p class="text-xs uppercase tracking-wide">
                            {{ item.label }}
                        </p>
                    </div>

                    <p class="mt-2 font-semibold">
                        {{ item.value || '-' }}
                    </p>
                </div>
            </div>
        </UCard>

        <UCard class="overflow-hidden mt-6">
            <template #header>
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-graduation-cap" class="size-5 text-primary" />
                        <h3 class="md:text-lg font-semibold">
                            Admission Information
                        </h3>
                    </div>

                    <p class="text-xs-base text-muted">
                        Admission details, and the student's class, class teacher and house now.
                    </p>
                </div>
            </template>

            <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div v-for="i in 3" :key="i" class="rounded-2xl border border-default p-4 space-y-3 bg-gray-100 dark:bg-neutral-800">
                    <USkeleton class="h-3 w-20" />
                    <USkeleton class="h-5 w-32" />
                </div>
            </div>

            <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div
                    v-for="item in admissionDetails"
                    :key="item.label"
                    class="rounded-2xl border border-default bg-gray-100 p-4 transition hover:border-primary/40 dark:bg-neutral-800"
                >
                    <div class="flex items-center gap-2 text-muted">
                        <UIcon :name="item.icon" class="size-4" />
                        <p class="text-xs uppercase tracking-wide">
                            {{ item.label }}
                        </p>
                    </div>

                    <p class="mt-2 wrap-break-word font-semibold">
                        {{ item.value || '-' }}
                    </p>
                </div>
            </div>
        </UCard>

        <UCard class="overflow-hidden mt-6">
            <template #header>
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <UIcon name="i-lucide-users" class="size-5 text-primary" />
                        <h3 class="md:text-lg font-semibold">
                            Parent / Guardian Information
                        </h3>
                    </div>

                    <p class="text-xs-base text-muted">
                        Contact and family details for the student’s parent or guardian.
                    </p>
                </div>
            </template>

            <!-- Guardian contact -->
            <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div v-for="i in 6" :key="i" class="rounded-2xl border border-default bg-gray-100 p-4 space-y-3 dark:bg-neutral-800">
                    <USkeleton class="h-3 w-20" />
                    <USkeleton class="h-5 w-32" />
                </div>
            </div>

            <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div
                    v-for="item in guardianContact"
                    :key="item.label"
                    class="rounded-2xl border border-default bg-gray-100 p-4 transition hover:border-primary/40 dark:bg-neutral-800"
                >
                    <div class="flex items-center gap-2 text-muted">
                        <UIcon :name="item.icon" class="size-4" />
                        <p class="text-xs uppercase tracking-wide">
                            {{ item.label }}
                        </p>
                    </div>

                    <p class="mt-2 wrap-break-word font-semibold">
                        {{ item.value || '-' }}
                    </p>
                </div>
            </div>

            <!-- Father / Mother -->
            <div class="mt-6 grid gap-4 md:grid-cols-2">
                <div class="overflow-hidden rounded-2xl border border-default">
                    <div class="flex items-center gap-2 border-b border-default bg-gray-100 px-4 py-2.5 dark:bg-neutral-800">
                        <UIcon name="i-lucide-user-round" class="size-4 text-primary" />
                        <h4 class="text-sm font-semibold">
                            Father Details
                        </h4>
                    </div>

                    <div v-if="loading" class="space-y-3 p-4">
                        <USkeleton v-for="i in 3" :key="i" class="h-4 w-full" />
                    </div>

                    <div v-else class="divide-y divide-default">
                        <div v-for="item in fatherDetails" :key="item.label" class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                            <span class="text-muted">{{ item.label }}</span>
                            <span class="font-medium">{{ item.value || '-' }}</span>
                        </div>
                    </div>
                </div>

                <div class="overflow-hidden rounded-2xl border border-default">
                    <div class="flex items-center gap-2 border-b border-default bg-gray-100 px-4 py-2.5 dark:bg-neutral-800">
                        <UIcon name="i-lucide-user-round" class="size-4 text-primary" />
                        <h4 class="text-sm font-semibold">
                            Mother Details
                        </h4>
                    </div>

                    <div v-if="loading" class="space-y-3 p-4">
                        <USkeleton v-for="i in 3" :key="i" class="h-4 w-full" />
                    </div>

                    <div v-else class="divide-y divide-default">
                        <div v-for="item in motherDetails" :key="item.label" class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                            <span class="text-muted">{{ item.label }}</span>
                            <span class="font-medium">{{ item.value || '-' }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </UCard>
    </StudentView>
</template>

<script setup lang="ts">
const route = useRoute()
const store = useStudentStore()
const { record, loading } = storeToRefs(store)

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})

// Whole years since a "YYYY-MM-DD" date of birth, read as a local date (no timezone shift); null when unknown.
function ageOf(dob?: string | null): number | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dob || '')
    if (!m) return null
    const today = new Date()
    let years = today.getFullYear() - Number(m[1])
    const month = today.getMonth() + 1 - Number(m[2])
    if (month < 0 || (month === 0 && today.getDate() < Number(m[3]))) years--
    return years >= 0 ? years : null
}

const personalDetails = computed(() => {
    const s = record.value
    const age = ageOf(s?.dateOfBirth)
    return [
    { label: 'Given Names', icon: 'i-lucide-user-round', value: s?.givenNames },
    { label: 'Family Name', icon: 'i-lucide-user', value: s?.familyName },
    { label: 'Gender', icon: 'i-lucide-venus-and-mars', value: clean(s?.gender || '') },
    { label: 'Date of Birth', icon: 'i-lucide-calendar-days',
        value: s?.dateOfBirth ? `${formatDate(s.dateOfBirth)}${age !== null ? ` (${age} ${age === 1 ? 'year' : 'years'})` : ''}` : '' },
    { label: 'Nationality', icon: 'i-lucide-flag', value: clean(s?.nationality || '') },
    { label: 'Religion', icon: 'i-lucide-heart', value: clean(record.value?.religion || '') },
    { label: 'City', icon: 'i-lucide-map-pinned', value: s?.city },
    { label: 'Address', icon: 'i-lucide-house', value: s?.street }
    ]
})

// Previous school / last grade only apply to transfers and re-enrolments (shown for others only if filled in).
const admissionDetails = computed(() => {
    const s = record.value
    const transfer = s?.enrollmentType === 'TRANSFER' || s?.enrollmentType === 'RE_ENROLLMENT'
    return [
        { label: 'Admission Number', icon: 'i-lucide-id-card', value: s?.admissionNumber },
        { label: 'Admission Date', icon: 'i-lucide-calendar-check', value: s?.admissionDate ? formatDate(s.admissionDate) : '' },
        { label: 'Enrollment Type', icon: 'i-lucide-user-cog', value: ENROLLMENT_TYPES.find(t => t.value === s?.enrollmentType)?.label },
        { label: 'Current Class', icon: CLASS_ICON, value: s?.className },
        { label: 'Class Teacher', icon: 'i-lucide-user-check', value: s?.classTeacher },
        { label: 'House', icon: 'i-lucide-flag-triangle-right', value: s?.house?.name },
        ...(transfer || s?.previousSchool ? [{ label: 'Previous School', icon: 'i-lucide-school', value: s?.previousSchool }] : []),
        ...(transfer || s?.lastClass ? [{ label: 'Last Grade Completed', icon: 'i-lucide-book-open', value: s?.lastClass }] : [])
    ]
})

const guardianContact = computed(() => ([
    { label: 'Guardian Name', icon: 'i-lucide-user-round-check', value: `${record.value?.guardian?.givenNames || ''} ${record.value?.guardian?.familyName || ''}`.trim() },
    { label: 'Relationship', icon: 'i-lucide-users-round', value: clean(record.value?.relationship || '') },
    { label: 'Phone Number', icon: 'i-lucide-phone', value: record.value?.guardian?.phone },
    { label: 'Email', icon: 'i-lucide-mail', value: record.value?.guardian?.email },
    { label: 'City', icon: 'i-lucide-map-pinned', value: record.value?.guardian?.city },
    { label: 'Address', icon: 'i-lucide-house', value: record.value?.guardian?.street }
]))

const fatherDetails = computed(() => ([
    { label: 'Name', value: record.value?.family?.fatherName },
    { label: 'Occupation', value: record.value?.family?.fatherOccupation },
    { label: 'Contact', value: record.value?.family?.fatherContact }
]))

const motherDetails = computed(() => ([
    { label: 'Name', value: record.value?.family?.motherName },
    { label: 'Occupation', value: record.value?.family?.motherOccupation },
    { label: 'Contact', value: record.value?.family?.motherContact }
]))

onMounted(() => {
    useAppStore().setTitle('View Student')
    useAppStore().setBack((route.query.back as string) || '/students')

    document.title = 'View Student | Students | Skultem'
})
</script>
