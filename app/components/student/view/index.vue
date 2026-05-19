<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-2 md:py-4 pb-0 space-y-3">
        <Heading title="View Student"
            subtitle="View detailed student information, including academic records, personal details, and enrollment data.">
            <div class="flex space-x-2 items-center">
                <UButton to="/students" variant="outline" size="sm" color="primary" label="All Students" />
                <UButton :to="`/students/${record?.id}/edit`" size="sm" variant="outline" color="secondary" :icon="EDIT_ICON"
                    label="Edit" />
            </div>
        </Heading>

        <div class="flex flex-col lg:flex-row gap-5">
            <div class="lg:w-1/3">
                <UCard class="sticky top-0">
                    <div class="flex flex-col items-center">
                        <!-- Avatar -->
                        <div class="border-b py-6 border-gray-200 dark:border-gray-800 w-full flex flex-col items-center">

                            <div v-if="loading" class="h-40 w-40 rounded-full bg-gray-200 animate-pulse" />
                            <img v-else :src="photo" :alt="name" class="rounded-full h-40 border-2 bg-white border-gray-100 dark:border-gray-600 w-40 object-cover" />

                            <div class="text-center mt-3 space-y-2">
                                <div v-if="loading" class="h-5 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
                                <h2 v-else class="text-xl font-semibold">
                                    {{ name }}
                                </h2>

                                <div v-if="loading" class="h-3 w-20 bg-gray-200 rounded animate-pulse mx-auto" />
                                <p v-else class="text-xs text-muted">
                                    {{ record?.className }}
                                </p>
                            </div>
                        </div>

                        <!-- Info List -->
                        <div class="w-full mt-3 space-y-3">
                            <div class="flex items-center justify-between">
                                <p class="text-sm text-muted">Admission No</p>
                                <USkeleton v-if="loading" class="w-28 h-3" />
                                <p class="font-medium" v-else>{{ record?.admissionNumber }}</p>
                            </div>

                            <div class="flex items-center justify-between">
                                <p class="text-sm text-muted">Gender</p>
                                <USkeleton v-if="loading" class="w-28 h-3" />
                                <p class="font-medium" v-else>{{ clean(record?.gender || '') }}</p>
                            </div>

                            <div class="flex items-center justify-between">
                                <p class="text-sm text-muted">Nationality</p>
                                <USkeleton v-if="loading" class="w-28 h-3" />
                                <p class="font-medium" v-else>{{ clean(record?.nationality || '') }}</p>
                            </div>

                            <div class="flex items-center justify-between">
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
                <Tab :tabs="[
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
    store.viewStudent(route.params.id as string)
}

onMounted(() => {
    fetchStudent()
})
</script>