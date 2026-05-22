<script lang="ts" setup>
import type { RadioGroupItem } from '@nuxt/ui'
import * as yup from 'yup'

interface Group {
    id: string
    name: string
    subjects: RadioGroupItem[]
    select: number
}

const classSession = useClassSessionStore()
const subjectStore = useClassSubjectStore()

const { state } = defineProps<{
    state: {
        enrollmentType: string
        admissionDate: string
        classId: string
        admissionNumber: string
        previousSchool: string
        lastGradeCompleted: string
        coreSubjects?: string[]
        optionalSubjects?: Record<string, string>
    }
}>()

const emit = defineEmits<{
    next: [any]
    back: []
}>()

const form = reactive({
    enrollmentType: '',
    admissionDate: '',
    classId: '',
    admissionNumber: '',
    previousSchool: '',
    lastGradeCompleted: '',
    optionalSubjects: {} as Record<string, string>
})

const selectedCore = ref<string[]>([])
const selectedOptional = reactive<Record<string, string>>({})

const coreSubjects = ref<ClassSubject[]>([])
const optionalGroups = ref<Group[]>([])

const isTransfer = computed(() =>
    form.enrollmentType === 'TRANSFER' || form.enrollmentType === 'RE_ENROLLMENT'
)

const schema = yup.object({
    enrollmentType: yup.string().required('Enrollment type is required'),

    admissionDate: yup
        .string()
        .required('Admission date is required')
        .test('not-future', 'Admission date cannot be in the future', value => {
            if (!value) return false
            const selected = new Date(value)
            const today = new Date()
            today.setHours(23, 59, 59, 999)
            return selected <= today
        }),

    classId: yup.string().required('Class is required'),

    admissionNumber: yup.string().required('Student ID is required'),

    previousSchool: yup.string().when('enrollmentType', {
        is: (val: string) => val === 'TRANSFER' || val === 'RE_ENROLLMENT',
        then: (s) => s.required('Previous school is required for transfer/re-enrolled students'),
        otherwise: (s) => s.optional()
    }),

    lastGradeCompleted: yup.string().when('enrollmentType', {
        is: (val: string) => val === 'TRANSFER' || val === 'RE_ENROLLMENT',
        then: (s) => s.required('Last grade completed is required for transfer/re-enrolled students'),
        otherwise: (s) => s.optional()
    }),

    optionalSubjects: yup
        .object()
        .test(
            'optional-subjects-validation',
            'Please select all required optional subjects',
            function (value: any) {
                for (const group of optionalGroups.value) {
                    const selected = value?.[group.id]
                    if (!selected) {
                        return this.createError({
                            path: `optionalSubjects.${group.id}`,
                            message: `Please select a subject for ${group.name}`
                        })
                    }
                }
                return true
            }
        )
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

function splitSubjects(subjects: any[]) {
    const core: ClassSubject[] = []
    const map = new Map<string, Group>()

    for (const s of subjects) {
        const isGrouped = s.groupId && s.groupName !== 'N/A'

        if (!isGrouped) {
            core.push(s)
            continue
        }

        if (!map.has(s.groupId)) {
            map.set(s.groupId, {
                id: s.groupId,
                name: s.groupName,
                subjects: [],
                select: s.select
            })
        }

        map.get(s.groupId)!.subjects.push({
            label: s.subjectName,
            description: s.teacherName,
            value: s.subjectId
        })
    }

    return {
        core,
        groups: Array.from(map.values())
    }
}

async function fetchSubjects(classId: string) {
    if (!classId) return

    const clazz: any = classSession.records.find(e => e.id === classId)
    if (!clazz) return

    const res = await subjectStore.fetchAllByClass(clazz.clazzId, 0, 0)
    const { core, groups } = splitSubjects(res)

    coreSubjects.value = core
    optionalGroups.value = groups

    for (const group of groups) {
        if (!selectedOptional[group.id]) {
            selectedOptional[group.id] = ''
        }
    }
}

watch(selectedOptional, (val) => {
    form.optionalSubjects = { ...val }
}, { deep: true })

watch(() => form.classId, async (val) => {
    if (val) {
        selectedCore.value = []
        Object.keys(selectedOptional).forEach(key => {
            selectedOptional[key] = ''
        })
        await fetchSubjects(val)
    }
}, { immediate: true })

watch(() => state, (val) => {
    if (!val) return
    Object.assign(form, val)
    selectedCore.value = val.coreSubjects || []
    if (val.optionalSubjects) {
        Object.assign(selectedOptional, val.optionalSubjects)
        form.optionalSubjects = { ...val.optionalSubjects }
    }
}, { immediate: true, deep: true })

function submit() {
    emit('next', {
        ...form,
        selectedOptionIds: selectedOptional
    })
}

function back() {
    emit('back')
}

onMounted(() => {
    classSession.fetchAll(0, 0)
})
</script>

<template>
    <UCard :ui="{ body: 'sm:p-0' }">
        <template #header>
            <div>
                <p class="text-xl font-semibold">Academic Information</p>
                <p class="text-sm text-muted">Admission and enrollment details for the student.</p>
            </div>
        </template>

        <UForm :state="form" :schema="schema" @submit="submit">
            <!-- FORM FIELDS -->
            <div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">

                <UFormField name="enrollmentType" label="Enrollment Type" required>
                    <USelectMenu value-key="value" v-model="form.enrollmentType" :items="enrollmentTypes" />
                    <template #help>
                        Select "New" for first-time students, "Transfer" for those coming from another school,
                        or "Re-enrolled" for students returning after a break.
                    </template>
                </UFormField>

                <UFormField name="admissionDate" label="Admission Date" required>
                    <UInput type="date" v-model="form.admissionDate" />
                    <template #help>
                        The date the student is officially admitted. Cannot be a future date.
                    </template>
                </UFormField>

                <UFormField name="classId" label="Grade / Class" required>
                    <USelectMenu value-key="value" v-model="form.classId" :items="classes" />
                    <template #help>
                        Select the class session the student will be enrolled in. Subject options will load after selection.
                    </template>
                </UFormField>

                <UFormField name="admissionNumber" label="Student ID" required>
                    <UInput v-model="form.admissionNumber" placeholder="e.g. STU-2025-0042" />
                    <template #help>
                        Enter the unique student ID assigned by the school. This will be used across all records.
                    </template>
                </UFormField>

                <UFormField
                    name="previousSchool"
                    label="Previous School"
                    :required="isTransfer"
                >
                    <UInput v-model="form.previousSchool" placeholder="Enter name of previous school" />
                    <template #help>
                        <span v-if="isTransfer">Required for transfer and re-enrolled students.</span>
                        <span v-else>Optional. Only required if the student is transferring or re-enrolling.</span>
                    </template>
                </UFormField>

                <UFormField
                    name="lastGradeCompleted"
                    label="Last Grade Completed"
                    :required="isTransfer"
                >
                    <UInput v-model="form.lastGradeCompleted" placeholder="e.g. Grade 5, JSS 2" />
                    <template #help>
                        <span v-if="isTransfer">Required for transfer and re-enrolled students.</span>
                        <span v-else>Optional. Enter the highest grade the student successfully completed.</span>
                    </template>
                </UFormField>

            </div>

            <!-- SUBJECTS -->
            <div v-if="form.classId" class="space-y-6 pb-6">

                <!-- CORE SUBJECTS -->
                <div class="px-5 space-y-3">
                    <div class="flex justify-between items-center">
                        <div class="flex gap-2 items-center">
                            <UIcon :name="LOCK_ICON" />
                            <p class="font-medium">Core Subjects</p>
                        </div>
                        <UBadge label="Required" color="primary" />
                    </div>

                    <!-- Subjects list -->
                    <div v-if="coreSubjects.length" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div
                            v-for="subject in coreSubjects"
                            :key="subject.id"
                            class="border rounded-xl p-4 bg-primary/5 border-primary"
                        >
                            <div class="flex justify-between items-start">
                                <div>
                                    <p class="font-medium">{{ subject.subjectName }}</p>
                                    <p class="text-sm text-muted">{{ subject.teacherName }}</p>
                                </div>
                                <UIcon :name="CHECK_ICON" />
                            </div>
                        </div>
                    </div>

                    <!-- Empty state -->
                    <p v-else class="text-sm text-muted">
                        No core subjects are assigned to this class yet.
                    </p>
                </div>

                <!-- OPTIONAL SUBJECT GROUPS -->
                <div v-for="group in optionalGroups" :key="group.id" class="px-5 space-y-3">
                    <div class="flex justify-between items-center">
                        <div class="flex gap-2 items-center">
                            <UIcon :name="BOOK_ICON" />
                            <p class="font-medium">{{ group.name }}</p>
                        </div>
                        <UBadge
                            variant="soft"
                            color="neutral"
                            :label="group.select > 1 ? `Select ${group.select}` : 'Select One'"
                        />
                    </div>

                    <UFormField :name="`optionalSubjects.${group.id}`">
                        <URadioGroup
                            v-model="selectedOptional[group.id]"
                            :items="group.subjects"
                            value-key="value"
                            orientation="vertical"
                            variant="card"
                            indicator="end"
                            :ui="{
                                wrapper: 'grid md:grid-cols-2 gap-3',
                                item: 'w-full'
                            }"
                        />
                    </UFormField>
                </div>

            </div>

            <!-- FOOTER -->
            <div class="flex px-5 py-4 justify-between items-center border-t border-default">
                <p class="text-sm text-muted">Step 3 of 4</p>
                <div class="flex gap-2">
                    <UButton @click="back" :icon="BACK_ICON" label="Back" variant="outline" color="neutral" />
                    <UButton type="submit" label="Next Step" :trailing-icon="NEXT_ICON" />
                </div>
            </div>
        </UForm>
    </UCard>
</template>