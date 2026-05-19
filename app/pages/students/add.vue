<template>
    <div class="md:px-5 overflow-y-auto h-full md:space-y-5 p-4 py-2 md:py-4 pb-0 space-y-3">
        <Heading title="Enroll Student" subtitle="Add a new student to the system and assign their academic details." />
        <div class="flex gap-5 items-start">
            <div class="w-1/4 sticky top-5 self-start">
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
            <div class="flex-1">
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
            <div class="p-6 space-y-5 text-center">

                <div class="flex flex-col items-center space-y-2">
                    <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                        <UIcon name="i-lucide-check" class="text-green-600 text-2xl" />
                    </div>

                    <h2 class="text-lg font-semibold">Enrollment Successful</h2>
                    <p class="text-sm text-muted">
                        The student has been successfully enrolled into the system.
                    </p>
                </div>

                <div class="flex gap-3 justify-center pt-2">

                    <UButton color="primary" :trailing-icon="VIEW_ICON" @click="() => {
                        successModal = false
                        navigateTo(`/students/${createdStudentId}`)
                    }">
                        View Profile
                    </UButton>

                    <UButton color="neutral" variant="subtle" :trailing-icon="ADD_ICON" @click="() => {
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
    lastGradeCompleted: ''
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
        lastGradeCompleted: param.lastGradeCompleted
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