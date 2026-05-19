<script lang="ts" setup>
import * as yup from 'yup'

const classSession = useClassSessionStore()
const { state } = defineProps<{
    state: {
        enrollmentType: string
        admissionDate: string
        classId: string
        admissionNumber: string
        previousSchool: string
        lastGradeCompleted: string
    }
}>()

const emit = defineEmits<{
    next: [typeof form]
    back: []
}>()

const schema = yup.object({
    enrollmentType: yup.string().required('Enrollment type is required'),
    admissionDate: yup.string().required('Admission date is required'),
    classId: yup.string().required('Grade / Class is required'),
    admissionNumber: yup.string().required('Admission number is required')
})

const form = reactive({
    enrollmentType: '',
    admissionDate: '',
    classId: '',
    admissionNumber: '',
    previousSchool: '',
    lastGradeCompleted: ''
})

const enrollmentTypes = [
    { label: 'New', value: 'NEW' },
    { label: 'Transfer', value: 'TRANSFER' },
    { label: 'Re-enrolled', value: 'RE_ENROLLMENT' }
]

const classes = computed(() =>
    classSession.records.map((e: any) => ({
        label: parseClassSession(e),
        value: e.id
    }))
)

function submit() {
    emit('next', {
        ...form
    })
}

function back() {
    emit('back')
}

watch(() => state, (newVal) => {
    if (!newVal) return
    Object.assign(form, { ...newVal })
}, {
    immediate: true
})

onMounted(() => {
    classSession.fetchAll(0, 0)
})
</script>

<template>
    <UCard :ui="{ body: 'sm:p-0' }">
        <template #header>
            <div>
                <p class="text-xl font-semibold">
                    Academic Information
                </p>

                <p class="text-sm text-muted">
                    Admission and enrollment details for the student.
                </p>
            </div>
        </template>

        <UForm :state="form" :schema="schema" @submit="submit">
            <div>
                <div class="p-5 border-b dark:border-gray-800 border-gray-200 grid grid-cols-2 gap-4">
                    <UFormField name="enrollmentType" label="Enrollment type" required>
                        <USelectMenu placeholder="Select enrollment type" value-key="value"
                            v-model="form.enrollmentType" :items="enrollmentTypes" />
                    </UFormField>
                    <UFormField name="admissionDate" label="Admission date" required>
                        <UInput type="date" v-model="form.admissionDate" />
                    </UFormField>
                    <UFormField name="classId" label="Grade / Class" required>
                        <USelectMenu placeholder="Select grade / class" value-key="value" v-model="form.classId"
                            :items="classes" />
                    </UFormField>
                    <UFormField name="admissionNumber" label="Student ID" required>
                        <UInput placeholder="Enter student ID" v-model="form.admissionNumber" />
                    </UFormField>

                    <UFormField name="previousSchool" label="Previous school name">
                        <UInput placeholder="Enter previous school name" v-model="form.previousSchool" />
                    </UFormField>
                    <UFormField name="lastGradeCompleted" label="Last grade completed">
                        <UInput placeholder="Enter last grade completed" v-model="form.lastGradeCompleted" />
                    </UFormField>
                </div>
                <div class="flex px-5 py-4 justify-between items-center">
                    <p class="text-sm text-muted">
                        Step 3 of 4
                    </p>
                    <div class="space-x-2 flex items-center">
                        <UButton @click="back" :icon="BACK_ICON" label="Back" variant="outline" color="neutral" />
                        <UButton type="submit" label="Next Step" :trailing-icon="NEXT_ICON"
                            @click="submit" />
                    </div>
                </div>
            </div>
        </UForm>
    </UCard>
</template>
