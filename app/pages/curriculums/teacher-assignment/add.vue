<template>
    <UForm class="p-6" :state="state" :schema="schema" @submit="onSubmit">
        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">

            <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div class="space-y-1">
                    <h2 class="text-2xl font-semibold text-gray-800">
                        Assign Class Subjects to Teacher
                    </h2>
                    <p class="text-xs text-mute">
                        Define the curriculum structure for this class.
                    </p>
                </div>
                <UFormField class="w-1/3" label="Select Class" name="classId">
                    <USelect :loading="classStore.loading" v-model="state.classId" @change="fetchRecord"
                        :items="classes" placeholder="Choose a class" />
                </UFormField>
            </div>
            <div v-if="state.classId" class="px-6 py-3">

                <!-- Section Header -->
                <div class="flex items-center border-b pb-3 border-gray-200 justify-between">
                    <h3 class="text-sm font-semibold text-gray-700">
                        Subject Assignments ({{ state.assignments.length }})
                    </h3>
                </div>

                <!-- Empty State -->
                <div v-if="!state.assignments.length"
                    class="border border-dashed border-gray-300 rounded-lg p-10 text-center">
                    <p class="text-sm text-gray-500 mb-4">
                        No subjects assigned yet.
                    </p>
                </div>

                <!-- Table -->
                <UTable v-else :columns="columns" :loading="store.loading" :data="state.assignments">
                    <!-- Subject -->
                    <template #subjectId-cell="{ row }">
                        <UFormField :name="`assignments.${row.index}.subjectId`">
                            <USelect disabled :items="subjects" :loading="subjectStore.loading"
                                placeholder="Select Subject" v-model="row.original.subjectId" />
                        </UFormField>
                    </template>
                    <!-- Teacher -->
                    <template #teacherId-cell="{ row }">
                        <UFormField :name="`assignments.${row.index}.teacherId`">
                            <USelect :loading="teacherStore.loading" :items="teachers" placeholder="Select Teacher"
                                v-model="row.original.teacherId" />
                        </UFormField>
                    </template>
                </UTable>
                <div class="flex gap-3 py-4 border-t border-gray-200">
                    <UButton type="submit" color="primary" icon="lucide:save" label="Save Changes" :loading="saving" />
                    <UButton color="neutral" variant="outline" label="Cancel" @click="resetForm" />
                </div>
            </div>
        </div>
    </UForm>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import * as yup from 'yup'

const store = useTeacherSubjectStore()
const subjectStore = useSubjectStore()
const classStore = useClassSessionStore()
const teacherStore = useTeacherStore()
const toast = useToast()

const saving = ref(false)

type ClassSubjectForm = {
    classId: string
    assignments: AssignmentTeacherSubject[]
}

const state = reactive<ClassSubjectForm>({
    classId: '',
    assignments: []
})

const schema = yup.object({
    classId: yup.string().required('Class is required'),
    assignments: yup.array().of(
        yup.object({
            subjectId: yup.string().required('Subject is required'),
            teacherId: yup.string().required('Teacher is required')
        })
    )
})

const columns: TableColumn<any>[] = [
    { accessorKey: 'subjectId', header: 'Subject' },
    { accessorKey: 'teacherId', header: 'Teacher' }
]

const classes = computed(() =>
    classStore.records.map(e => ({
        label: parseClassSession(e),
        value: e.id
    }))
)

const teachers = computed(() =>
    teacherStore.records.map(e => ({
        label: `${e.user.givenNames} ${e.user.familyName}`,
        value: e.id
    }))
)

const subjects = computed(() =>
    subjectStore.records.map(e => ({
        label: e.name,
        value: e.id
    }))
)

function resetForm() {
    state.classId = ''
    state.assignments = []
    navigateTo("/curriculums/teacher-assignment")
}

async function fetchRecord() {
    if (!state.classId) return
    state.assignments = []
    const list = await store.fetchAllByClass(state.classId, 0, 0)

    if (list && list.length) {
        state.assignments = list.map((e: TeacherSubject) => ({
            id: e.id,
            subjectId: e.subjectId,
            teacherId: e.teacherId
        }))
    }
}

async function onSubmit() {
    try {
        saving.value = true

        await store.create(state.classId, {
            assignments: state.assignments
        })

        toast.add({
            title: 'Success',
            description: 'Teacher subjects assign successfully',
            color: 'success'
        })

        navigateTo('/curriculums/teacher-assignment')

    } catch (err: any) {
        toast.add({
            description: err.message,
            color: 'error'
        })
    } finally {
        saving.value = false
    }
}

onMounted(() => {
    subjectStore.fetchAll(0, 0)
    classStore.fetchAll(0, 0)
    teacherStore.fetchAll(0, 0)
    useAppStore().setTitle('Assign Teacher Subject')
    document.title = 'Teacher Subject | Assign Teacher Subject | Skultem'
})
</script>