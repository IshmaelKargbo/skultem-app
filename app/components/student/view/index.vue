<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-2 md:py-4 pb-0 space-y-3">
        <Heading title="View Student"
            subtitle="View detailed student information, including academic records, personal details, and enrollment data.">
            <div class="flex space-x-2 items-center">
                <UButton to="/students" variant="outline" size="sm" color="primary" label="All Students" />
                <UButton v-if="record && !loading" :to="`/students/${record.id}/edit`" size="sm" variant="outline" color="secondary"
                    :icon="EDIT_ICON" label="Edit" />
            </div>
        </Heading>

        <div class="flex flex-col lg:flex-row gap-5">
            <div class="lg:w-1/3">
                <UCard class="sticky top-0">
                    <div class="flex flex-col items-center">
                        <!-- Avatar -->
                        <div
                            class="border-b pb-1 border-gray-200 dark:border-gray-800 w-full flex flex-col items-center">
                            <USkeleton v-if="loading"
                                class="h-72 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
                            <div v-else class="w-full rounded-xl border-2 overflow-hidden p-0.5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600">
                                <img :src="photo" :alt="name"
                                    class="w-full rounded-lg object-cover h-72" />
                            </div>

                            <div class="flex justify-between items-center gap-1 mt-3 w-full text-center">
                                <USkeleton v-if="loading"
                                    class="h-5 w-40 bg-gray-200 dark:bg-gray-800" />
                                <h2 v-else class="text-base font-semibold">
                                    {{ name }}
                                </h2>

                                <USkeleton v-if="loading"
                                    class="h-3 w-24 bg-gray-200 dark:bg-gray-800" />
                                <p v-else class="text-xs text-muted">
                                    {{ record?.className || 'No class assigned' }}
                                </p>
                            </div>
                        </div>

                        <!-- Info List -->
                        <div class="w-full mt-2 space-y-2">
                            <div class="flex items-center justify-between bg-gray-50 dark:bg-neutral-800 rounded-lg p-3">
                                <p class="text-sm text-muted">Admission</p>
                                <USkeleton v-if="loading" class="w-28 h-3" />
                                <p class="font-medium" v-else>{{ record?.admissionNumber }}</p>
                            </div>

                            <div class="flex items-center justify-between bg-gray-50 dark:bg-neutral-800 rounded-lg p-3">
                                <p class="text-sm text-muted">Gender</p>
                                <USkeleton v-if="loading" class="w-28 h-3" />
                                <p class="font-medium" v-else>{{ clean(record?.gender || '') }}</p>
                            </div>

                            <div class="flex items-center justify-between bg-gray-50 dark:bg-neutral-800 rounded-lg p-3">
                                <p class="text-sm text-muted">Nationality</p>
                                <USkeleton v-if="loading" class="w-28 h-3" />
                                <p class="font-medium" v-else>{{ clean(record?.nationality || '') }}</p>
                            </div>

                            <div class="flex items-center justify-between bg-gray-50 dark:bg-neutral-800 rounded-lg p-3">
                                <p class="text-sm text-muted">Religion</p>
                                <USkeleton v-if="loading" class="w-28 h-3" />
                                <p class="font-medium" v-else>{{ clean(record?.religion || '') }}</p>
                            </div>
                        </div>
                    </div>
                </UCard>
            </div>

            <!-- Student Details -->
            <div class="flex-1 space-y-5">
                <TabMobile class="md:hidden" :tabs="[
                    { label: 'Personal', to: personalInfo, exact: true },
                    { label: 'Attendance', to: attendanceInfo, exact: true },
                    { label: 'Fees', to: feeStructureInfo, exact: true },
                    { label: 'Academics', to: academicInfo, exact: true }
                ]" />
                <Tab class="hidden md:block" :tabs="[
                    { label: 'Personal Information', to: personalInfo, exact: true },
                    { label: 'Attendance', to: attendanceInfo, exact: true },
                    { label: 'Fee Structure', to: feeStructureInfo, exact: true },
                    { label: 'Academic Information', to: academicInfo, exact: true }
                ]" />
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const store = useStudentStore()

const { record, loading } = storeToRefs(store)
const route = useRoute()

definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR]
})

const name = computed(() => {
    if (!record.value) return ''
    return `${record.value.givenNames} ${record.value.familyName}`
})

const photo = computed(() => {
    if (!record.value) return '/avatar-placeholder.svg'
    return record.value.photo || '/avatar-placeholder.svg'
})

const personalInfo = `/students/${route.params.id}`
const attendanceInfo = `/students/${route.params.id}/attendance`
const feeStructureInfo = `/students/${route.params.id}/fee-structure`
const academicInfo = `/students/${route.params.id}/academic-information`

async function fetchStudent() {
    await store.viewStudent(route.params.id as string)
}

watch(() => route.params.id, () => {
    fetchStudent()
}, { immediate: true })
</script>
