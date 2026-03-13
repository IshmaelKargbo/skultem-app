<template>
    <UForm class="p-6" :state="state" :schema="schema" @submit="onSubmit">
        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">

            <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div class="space-y-1">
                    <h2 class="text-2xl font-semibold">
                        Assign Subjects to Class
                    </h2>
                    <p class="text-xs text-mute">
                        Define the curriculum structure for this class.
                    </p>
                </div>
                <UFormField class="min-w-sm" label="Select Class" name="classId">
                    <USelectMenu value-key="value" :loading="classStore.loading" v-model="state.classId" @change="fetchRecord"
                        :items="classes" placeholder="Choose a class" />
                </UFormField>
            </div>
            <div v-if="state.classId" class="px-6 py-3">
                <div v-if="lockedCount > 0" class="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    {{ lockedCount }} subject(s) are locked because student assessments already have grades. Locked rows are view-only.
                </div>
                <!-- Section Header -->
                <div class="flex items-center border-b pb-3 border-gray-200 justify-between">
                    <h3 class="text-sm font-semibold text-gray-700">
                        Subject Assignments ({{ state.assignments.length }})
                    </h3>

                    <UButton variant="subtle" color="primary" icon="prime:plus" label="Add Subject" @click="add" />
                </div>

                <!-- Empty State -->
                <div v-if="!state.assignments.length"
                    class="border border-dashed border-gray-300 rounded-lg p-10 text-center">
                    <p class="text-sm text-gray-500 mb-4">
                        No subjects assigned yet.
                    </p>
                    <UButton icon="prime:plus" label="Add First Subject" @click="add" />
                </div>

                <!-- Table -->
                <UTable v-else :columns="columns" :loading="store.loading" :data="state.assignments">

                    <!-- Subject -->
                    <template #subjectId-cell="{ row }">
                        <UFormField :name="`assignments.${row.index}.subjectId`">
                            <USelectMenu value-key="value" :items="availableSubjects(row.index)" :loading="subjectStore.loading"
                                placeholder="Select Subject" v-model="row.original.subjectId" :disabled="Boolean(row.original.locked)" />
                        </UFormField>
                    </template>

                    <!-- Group -->
                    <template #groupId-cell="{ row }">
                        <UFormField :name="`assignments.${row.index}.groupId`">
                            <USelectMenu value-key="value" :loading="subjectGroupStore.loading" :items="groups"
                                placeholder="Select Group" v-model="row.original.groupId" :disabled="disableByLevel || Boolean(row.original.locked)" />
                        </UFormField>
                    </template>

                    <!-- Mandatory Badge -->
                    <template #mandatory-cell="{ row }">
                        <div class="flex">
                            <USwitch :disabled="disableByLevel || Boolean(row.original.locked)" label="Mandatory" v-model="row.original.mandatory" />
                        </div>
                    </template>

                    <!-- Actions -->
                    <template #actions-cell="{ row }">
                        <div class="flex justify-end">
                            <UButton v-if="showDelete() && !row.original.locked" @click="remove(row.index)" variant="ghost" color="error"
                                icon="lucide:trash-2" />
                            <UBadge v-else-if="row.original.locked" color="neutral" variant="soft" label="Locked" />
                        </div>
                    </template>
                </UTable>

                <!-- Summary -->
                <div v-if="state.assignments.length" class="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                    Total Subjects:
                    <strong>{{ state.assignments.length }}</strong>
                    |
                    Core:
                    <strong>
                        {{state.assignments.filter(a => a.mandatory).length}}
                    </strong>
                    |
                    Optional:
                    <strong>
                        {{state.assignments.filter(a => !a.mandatory).length}}
                    </strong>
                </div>
                <div class="flex gap-3 border-t border-gray-200 py-4 mt-3">
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

const store = useClassSubjectStore()
const subjectStore = useSubjectStore()
const classStore = useClassSessionStore()
const subjectGroupStore = useSubjectGroupStore()
const toast = useToast()

const saving = ref(false)

const disableByLevel = computed(() => selectedClass.value?.classLevel == 'PRIMARY')

type ClassSubjectForm = {
    classId: string
    assignments: AssignmentSubject[]
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
            mandatory: yup.boolean().required()
        })
    )
})

const columns: TableColumn<any>[] = [
    { accessorKey: 'subjectId', header: 'Subject' },
    { accessorKey: 'groupId', header: 'Group' },
    {
        accessorKey: 'mandatory', header: 'Type'
    },
    { id: 'actions' }
]

const classes = computed(() =>
    classStore.records.filter(e => (e.classLevel != 'SSS')).map(e => ({
        label: e.clazz,
        value: e.clazzId
    }))
)

const selectedClass = computed(() =>
    classStore.records.find(e => (e.clazzId == state.classId))
)
const lockedCount = computed(() => state.assignments.filter(item => item.locked).length)

const groups = ref<{ label: string; value: string }[]>([])

const availableSubjects = (index: number) => {
    const selected = state.assignments
        .map((a, i) => (i !== index ? a.subjectId : null))
        .filter(Boolean)

    return subjectStore.records
        .filter(s => !selected.includes(s.id))
        .map(s => ({ label: s.name, value: s.id }))
}

const showDelete = () => state.assignments.length > 1

function add() {
    state.assignments.push({
        subjectId: '',
        groupId: '',
        mandatory: disableByLevel ? true : false,
        locked: false
    })
}

function remove(index: number) {
    if (state.assignments[index]?.locked) {
        toast.add({
            description: 'Locked subjects cannot be removed',
            color: 'warning'
        })
        return
    }
    state.assignments.splice(index, 1)
}

function resetForm() {
    state.classId = ''
    state.assignments = []
    navigateTo("/curriculums/class-subjects")
}

async function fetchRecord() {
    if (!state.classId) return

    const list = await store.fetchAllByClass(state.classId, 0, 0)

    if (list && list.length) {
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
            label: `${e.name} (${e.minSelection}/${e.maxSelection})`,
            value: e.id
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
            description: 'Class subjects assign successfully',
            color: 'success'
        })

        navigateTo('/curriculums/class-subjects')

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
    useAppStore().setTitle('Assign Class Subject')
    document.title = 'Class Subjects | Assign Class Subject | Skultem'
})
</script>
