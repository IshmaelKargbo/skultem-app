<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-2 md:py-4 pb-0 space-y-3 md:space-y-5">
        <Heading title="Enroll Student" subtitle="Add a new student to the system and assign their academic details." />
        <div class="md:hidden">
            <UCard :ui="{ body: 'p-4' }">
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0 flex-1">
                        <p class="text-xs font-semibold uppercase tracking-wider text-muted">
                            Step {{ state + 1 }} of {{ step.length }}
                        </p>

                        <p class="mt-1 text-base font-semibold text-highlighted">
                            {{ step[state]?.title }}
                        </p>

                        <p class="mt-1 text-sm text-muted">
                            {{ step[state]?.sub }}
                        </p>
                    </div>

                    <div class="flex shrink-0 items-center gap-1 pt-1">
                        <span
                            v-for="(value, i) in step"
                            :key="value.title"
                            class="h-2.5 w-2.5 rounded-full transition-colors"
                            :class="state >= i ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-800'"
                        />
                    </div>
                </div>

                <div class="mt-4 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                        class="h-full rounded-full bg-primary-500 transition-all duration-300"
                        :style="{ width: `${((state + 1) / step.length) * 100}%` }"
                    />
                </div>
            </UCard>
        </div>

        <div class="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)] md:gap-5">
            <div class="hidden md:block sticky top-5 self-start">
                <UCard>
                    <div class="space-y-4">
                        <div>
                            <p class="font-semibold text-lg">Progress</p>
                            <p class="text-sm text-muted">
                                Complete all enrollment steps.
                            </p>
                        </div>

                        <div class="space-y-3">
                            <div v-for="(value, i) in step" :key="i"
                                class="border-2 rounded-2xl p-3 flex items-start space-x-3 transition-all" :class="[
                                    state === i
                                        ? 'border-primary-400 dark:border-primary-700 dark:bg-gray-950 bg-primary/5'
                                        : state > i
                                            ? 'border-success-400 dark:bg-gray-950 bg-success-50'
                                            : 'border-gray-200 dark:border-gray-800'
                                ]">
                                <UAvatar :alt="(i + 1).toString()" :class="[
                                    state == i
                                        ? 'ring-2 ring-primary-300 dark:ring-primary-700'
                                        : '',
                                    state > i
                                        ? 'ring-2 ring-success-300'
                                        : ''
                                ]" />

                                <div class="flex-1">
                                    <div class="flex items-center justify-between">
                                        <p class="font-medium">
                                            {{ value.title }}
                                        </p>

                                        <UIcon v-if="state > i" name="i-lucide-check" class="text-green-500" />
                                    </div>

                                    <p class="text-xs text-muted">
                                        {{ value.sub }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </UCard>
            </div>
            <div class="min-w-0">
                <StudentAddPersonal :state="personal" @next="moveToParent" v-if="state === 0" />
                <StudentAddParent :state="parent" @next="moveToAcademic" @back="back" v-if="state === 1" />
                <StudentAddAcademic :state="academic" @back="back" @next="moveToProfile" v-if="state === 2" />
                <StudentAddProfile :loading="loading" :state="profile" @back="back" @submit="submit"
                    v-if="state === 3" />
            </div>
        </div>
    </div>
    <UModal v-model:open="successModal" :dismissible="false">
        <template #content>
            <div class="space-y-4 p-4 text-center sm:space-y-5 sm:p-6">

                <div class="flex flex-col items-center space-y-2">
                    <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                        <UIcon name="i-lucide-check" class="text-green-600 text-2xl" />
                    </div>

                    <h2 class="text-lg font-semibold">Enrollment Successful</h2>
                    <p class="text-sm text-muted">
                        The student has been successfully enrolled into the system.
                    </p>
                </div>

                <div class="flex flex-col gap-3 justify-center pt-2 sm:flex-row">

                    <UButton class="w-full justify-center sm:w-auto" color="primary" :trailing-icon="VIEW_ICON" @click="() => {
                        successModal = false
                        navigateTo(`/students/${createdStudentId}`)
                    }">
                        View Profile
                    </UButton>

                    <UButton class="w-full justify-center sm:w-auto" color="neutral" variant="subtle" :trailing-icon="ADD_ICON" @click="() => {
                        successModal = false
                        resetForm()
                    }">
                        Add New Student
                    </UButton>

                </div>
            </div>
        </template>
    </UModal>
</template>

<script setup lang="ts">
const loading = ref(false)
const successModal = ref(false)
const createdStudentId = ref<string | null>(null)
const store = useStudentStore()
const state = ref(0)

const step = [
    {
        title: 'Personal Information',
        sub: 'Student basic details'
    },
    {
        title: 'Parent / Guardian',
        sub: 'Guardian contact information'
    },
    {
        title: 'Academic Information',
        sub: 'Admission and class details'
    },
    {
        title: 'Student Profile',
        sub: 'Upload student profile image'
    }
]

const personal = reactive({
    givenNames: '',
    familyName: '',
    dob: '',
    gender: '',
    nationality: '',
    religion: '',
    city: '',
    street: ''
})

const profile = reactive({
    photo: null as File | null
})

function resetForm() {
    Object.assign(personal, {
        givenNames: '',
        familyName: '',
        dob: '',
        gender: '',
        nationality: '',
        religion: '',
        city: '',
        street: '',
    })
    Object.assign(parent, {
        fatherName: '',
        motherName: '',
        guardianGivenNames: '',
        guardianFamilyName: '',
        relationship: '',
        guardianPhone: '',
        guardianEmail: '',
        guardianOccupation: '',
        guardianCity: '',
        guardianAddress: ''
    })
    Object.assign(academic, {
        enrollmentType: '',
        admissionDate: '',
        classId: '',
        admissionNumber: '',
        previousSchool: '',
        lastGradeCompleted: ''
    })
    Object.assign(profile, {
        photo: null
    })

    state.value = 0
}

const parent = reactive({
    fatherName: '',
    motherName: '',
    motherOccupation: '',
    fatherOccupation: '',
    fatherContact: '',
    motherContact: '',

    existingGuardianId: '',

    guardianGivenNames: '',
    guardianFamilyName: '',
    relationship: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianCity: '',
    guardianAddress: ''
})

const academic = reactive({
    enrollmentType: '',
    admissionDate: '',
    classId: '',
    admissionNumber: '',
    previousSchool: '',
    lastGradeCompleted: '',
    selectedOptionIds: {} as Record<string, string>
})

function moveToParent(param: any) {
    Object.assign(personal, {
        givenNames: param.givenNames,
        familyName: param.familyName,
        dob: param.dob,
        gender: param.gender,
        nationality: param.nationality,
        religion: param.religion,
        city: param.city,
        street: param.street
    })

    Object.assign(parent, {
        guardianCity: param.city,
        guardianAddress: param.street
    })

    if (state.value === 3) return
    state.value++
}

function moveToProfile(param: any) {
    Object.assign(academic, {
        enrollmentType: param.enrollmentType,
        admissionDate: param.admissionDate,
        classId: param.classId,
        admissionNumber: param.admissionNumber,
        previousSchool: param.previousSchool,
        lastGradeCompleted: param.lastGradeCompleted,
        ...param
    })

    if (state.value === 3) return
    state.value++
}

function moveToAcademic(param: any) {
    Object.assign(parent, { ...param })
    if (state.value === 3) return
    state.value++
}

function back() {
    if (state.value === 0) return
    state.value--
}

async function submit(param: any) {
    Object.assign(profile, {
        photo: param.data.photo
    })

    if (profile.photo === null) {
        useNotify().error('Student photo is required')
        return
    }

    try {
        loading.value = true
        const formData = new FormData()
        const list = Object.values(academic.selectedOptionIds)

        const data = {
            ...personal,
            dateOfBirth: personal.dob,
            family: {
                fatherName: parent.fatherName,
                motherName: parent.motherName,
                fatherOccupation: parent.fatherOccupation,
                motherOccupation: parent.motherOccupation,
                motherContact: parent.motherContact,
                fatherContact: parent.fatherContact
            },
            parent: {
                familyName: parent.guardianFamilyName,
                givenNames: parent.guardianGivenNames,
                phone: parent.guardianPhone,
                email: parent.guardianEmail,
                relationship: parent.relationship,
                city: parent.guardianCity,
                street: parent.guardianAddress
            },
            selectedOptionIds: list,
            parentId: parent.existingGuardianId,
            classId: academic.classId,
            admissionNumber: academic.admissionNumber,
            admissionDate: academic.admissionDate,
            enrollmentType: academic.enrollmentType,
            previousSchool: academic.previousSchool,
            lastGradeCompleted: academic.lastGradeCompleted
        }


        if (profile.photo) {
            formData.append('photo', profile.photo)
        }

        formData.append(
            'data',
            new Blob(
                [JSON.stringify(data)],
                {
                    type: 'application/json'
                }
            )
        )

        const response: any = await store.create(formData)

        createdStudentId.value = response.id
        successModal.value = true
        useNotify().success('Student enrolled successfully')
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to enroll student'
        useNotify().error(message)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    useAppStore().setTitle('Enroll Student')
    useAppStore().setBack(true)
    document.title = 'Enroll Student | Students | Skultem'
})


definePageMeta({
    role: [Role.ADMIN, Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER]
})
</script>
