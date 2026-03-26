<template>
    <UForm class="p-7 space-y-5 h-full overflow-y-auto" :state="state" :schema="schema" @submit="onSubmit">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div class="space-y-1">
                <h2 class="text-2xl font-semibold">Assign Subjects to Class</h2>
                <p class="text-xs text-muted">Define the curriculum structure for this class.</p>
            </div>

            <UFormField class="min-w-sm" label="Select Class" name="classId">
                <USelectMenu value-key="value" :loading="classStore.loading" v-model="state.classId"
                    @change="fetchRecord" :items="classes" placeholder="Choose a class" />
            </UFormField>
        </div>

        <!-- Assignments card (shown only when a class is selected) -->
        <UCard v-if="state.classId">
            <!-- Locked warning -->
            <div v-if="lockedCount > 0"
                class="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {{ lockedCount }} subject(s) are locked because student assessments already have grades.
                Locked rows are view-only.
            </div>

            <!-- Section header -->
            <div class="flex items-center border-b pb-3 border-gray-200 justify-between">
                <h3 class="text-sm font-semibold text-gray-700">
                    Subject Assignments ({{ state.assignments.length }})
                </h3>
                <UButton variant="subtle" color="primary" icon="prime:plus" label="Add Subject" @click="add" />
            </div>

            <!-- Table -->
            <UTable :columns="columns" :loading="store.loading" :data="state.assignments">
                <!-- Subject column -->
                <template #subjectId-cell="{ row }">
                    <UFormField :name="`assignments.${row.index}.subjectId`">
                        <USelectMenu value-key="value" :items="availableSubjects(row.index)"
                            :loading="subjectStore.loading" placeholder="Select Subject"
                            v-model="row.original.subjectId" :disabled="Boolean(row.original.locked)" />
                    </UFormField>
                </template>

                <!-- Group column -->
                <template #groupId-cell="{ row }">
                    <UFormField :name="`assignments.${row.index}.groupId`">
                        <USelectMenu value-key="value" :items="groups" :loading="subjectGroupStore.loading"
                            placeholder="Select Group (Optional)" v-model="row.original.groupId"
                            :disabled="disableByLevel || Boolean(row.original.locked)" />
                    </UFormField>
                </template>

                <!-- Mandatory column -->
                <template #mandatory-cell="{ row }">
                    <div class="flex">
                        <USwitch label="Mandatory" v-model="row.original.mandatory"
                            :disabled="disableByLevel || Boolean(row.original.locked)" />
                    </div>
                </template>

                <!-- Actions column -->
                <template #actions-cell="{ row }">
                    <div class="flex justify-end">
                        <UButton v-if="showDelete() && !row.original.locked" @click="remove(row.index)" variant="ghost"
                            color="error" icon="lucide:trash-2" />
                        <UBadge v-else-if="row.original.locked" color="neutral" variant="outline" label="Locked" />
                    </div>
                </template>

                <!-- Empty state -->
                <template #empty>
                    <div class="border border-dashed border-gray-300 rounded-lg p-10 text-center">
                        <p class="text-sm text-gray-500 mb-4">No subjects assigned yet.</p>
                        <UButton icon="prime:plus" label="Add First Subject" @click="add" />
                    </div>
                </template>
            </UTable>

            <div v-if="state.assignments.length" class="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                Total Subjects: <strong>{{ state.assignments.length }}</strong>
                | Core: <strong>{{state.assignments.filter(a => a.mandatory).length}}</strong>
                | Optional: <strong>{{state.assignments.filter(a => !a.mandatory).length}}</strong>
            </div>

            <div class="flex gap-3 border-t border-gray-200 py-4 mt-3">
                <UButton type="submit" color="primary" icon="lucide:save" label="Save Changes" :loading="saving" />
                <UButton color="neutral" variant="outline" label="Cancel" @click="resetForm" />
            </div>
        </UCard>
        <UCard v-else>
            <div class="h-56 flex flex-col items-center justify-center gap-3 text-center">
                <div class="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                    <UIcon name="lucide:layout-list" class="w-6 h-6 text-gray-400" />
                </div>
                <div class="space-y-1">
                    <p class="text-sm font-medium text-gray-600">No Class Selected</p>
                    <p class="text-xs text-gray-400">
                        Choose a class from the dropdown above to manage its subject assignments.
                    </p>
                </div>
            </div>
        </UCard>
    </UForm>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import * as yup from 'yup'

const store = useClassSubjectStore()
const subjectStore = useSubjectStore()
const classStore = useClassSessionStore()
const subjectGroupStore = useSubjectGroupStore()

const { error: toastError, success: toastSuccess, warning: toastWarning } = useNotify()

type AssignmentRow = {
    subjectId: string
    groupId: string
    mandatory: boolean
    locked: boolean
}

type ClassSubjectForm = {
    classId: string
    assignments: AssignmentRow[]
}

const saving = ref(false)
const groups = ref<{ label: string; value: string }[]>([])

const state = reactive<ClassSubjectForm>({
    classId: '',
    assignments: []
})

const selectedClass = computed(() =>
    classStore.records.find(e => e.clazzId === state.classId)
)

const disableByLevel = computed(
    () => selectedClass.value?.classLevel === 'PRIMARY'
)

const lockedCount = computed(() =>
    state.assignments.filter(item => item.locked).length
)

const classes = computed(() =>
    classStore.records
        .filter(e => e.classLevel !== 'SSS')
        .map(e => ({ label: e.clazz, value: e.clazzId }))
)

const schema = yup.object({
    classId: yup.string().required('Class is required'),
    assignments: yup.array().of(
        yup.object({
            subjectId: yup.string().required('Subject is required'),
            groupId: yup.string().nullable().optional(),
            mandatory: yup.boolean().required()
        })
    )
})

const columns: TableColumn<AssignmentRow>[] = [
    { accessorKey: 'subjectId', header: 'Subject' },
    { accessorKey: 'groupId', header: 'Group' },
    { accessorKey: 'mandatory', header: 'Type' },
    { id: 'actions' }
]

const availableSubjects = (index: number) => {
    const selected = state.assignments
        .map((a, i) => (i !== index ? a.subjectId : null))
        .filter(Boolean)

    return subjectStore.records
        .filter(s => !selected.includes(s.id))
        .map(s => ({ label: s.name, value: s.id }))
}

const showDelete = () => state.assignments.length > 1

// ─── Actions ─────────────────────────────────────────────────────────────────

function add() {
    state.assignments.push({
        subjectId: '',
        groupId: '',
        mandatory: disableByLevel.value ? true : false,
        locked: false
    })
}

function remove(index: number) {
    if (state.assignments[index]?.locked) {
        toastWarning('Locked subjects cannot be removed')
        return
    }
    state.assignments.splice(index, 1)
}

function resetForm() {
    state.classId = ''
    state.assignments = []
    navigateTo('/curriculums/class-subjects')
}

async function fetchRecord() {
    if (!state.classId) return

    const list = await store.fetchAllByClass(state.classId, 0, 0)

    if (list?.length) {
        state.assignments = list.map((e: ClassSubject) => ({
            subjectId: e.subjectId,
            groupId: e.groupId,
            mandatory: e.mandatory,
            locked: Boolean(e.locked)
        }))
    } else {
        state.assignments = []
        add()
    }

    const groupRes = await subjectGroupStore.fetchAllByClass(state.classId)

    if (groupRes) {
        groups.value = groupRes.map((e: SubjectGroup) => ({
            label: `${e.name} (${e.totalSelection})`,
            value: e.id
        }))
    }
}

async function onSubmit() {
    try {
        saving.value = true

        await store.create(state.classId, {
            assignments: state.assignments.map(a => ({
                subjectId: a.subjectId,
                mandatory: a.mandatory,
                groupId: a.groupId || ''
            }))
        })

        toastSuccess('Class subjects assigned successfully')
        navigateTo('/curriculums/class-subjects')
    } catch (err: any) {
        toastError(err.message)
    } finally {
        saving.value = false
    }
}

onMounted(() => {
    subjectStore.fetchAll(0, 0)
    classStore.fetchAll(0, 0)
    useAppStore().setTitle('Class Subjects')
    document.title = 'Assign Class Subject | Class Subjects | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR]
})
</script>