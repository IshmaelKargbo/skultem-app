<template>
    <UForm class="p-6" :state="state" :schema="schema" @submit="onSubmit">
        <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">

            <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <div class="space-y-1">
                    <h2 class="text-2xl font-semibold">
                        Assign Subjects to Stream
                    </h2>
                    <p class="text-xs text-mute">
                        Define the curriculum structure for this stream.
                    </p>
                </div>

                <div v-if="state.streamId" class="flex gap-3">
                    <UButton type="submit" color="primary" :icon="SAVE_ICON" label="Save Changes" :loading="saving" />
                    <UButton color="neutral" variant="outline" label="Cancel" @click="resetForm" />
                </div>
            </div>

            <div class="px-6 py-4 bg-gray-50/20 border-b border-gray-100">
                <div class="max-w-sm">
                    <UFormField label="Select Stream" name="streamId">
                        <USelectMenu value-key="value" :loading="streamStore.loading" v-model="state.streamId" @change="fetchRecord"
                            :items="streams" placeholder="Choose a stream" />
                    </UFormField>
                </div>
            </div>

            <div v-if="state.streamId" class="px-6 py-3">

                <!-- Section Header -->
                <div class="flex items-center border-b pb-3 border-gray-200 justify-between">
                    <h3 class="text-sm font-semibold text-gray-700">
                        Subject Assignments ({{ state.assignments.length }})
                    </h3>

                    <UButton variant="soft" color="primary" icon="prime:plus" label="Add Subject" @click="add" />
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
                                placeholder="Select Subject" v-model="row.original.subjectId" />
                        </UFormField>
                    </template>

                    <!-- Group -->
                    <template #groupId-cell="{ row }">
                        <UFormField :name="`assignments.${row.index}.groupId`">
                            <USelectMenu value-key="value" :loading="subjectGroupStore.loading" :items="groups" placeholder="Select Group"
                                v-model="row.original.groupId" />
                        </UFormField>
                    </template>

                    <!-- Mandatory Badge -->
                    <template #mandatory-cell="{ row }">
                        <div class="flex">
                            <USwitch label="Mandatory" v-model="row.original.mandatory" />
                        </div>
                    </template>

                    <!-- Actions -->
                    <template #actions-cell="{ row }">
                        <div class="flex justify-end">
                            <UButton v-if="showDelete()" @click="remove(row.index)" variant="ghost" color="error"
                                icon="lucide:trash-2" />
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

            </div>
        </div>
    </UForm>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import * as yup from 'yup'

const store = useStreamSubjectStore()
const subjectStore = useSubjectStore()
const streamStore = useStreamStore()
const subjectGroupStore = useSubjectGroupStore()
const toast = useToast()

const saving = ref(false)

type StreamSubjectForm = {
    streamId: string
    assignments: AssignmentSubject[]
}

const state = reactive<StreamSubjectForm>({
    streamId: '',
    assignments: []
})

const schema = yup.object({
    streamId: yup.string().required('Stream is required'),
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

const streams = computed(() =>
    streamStore.records.map(e => ({
        label: e.name,
        value: e.id
    }))
)

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
        mandatory: false
    })
}

function remove(index: number) {
    state.assignments.splice(index, 1)
}

function resetForm() {
    state.streamId = ''
    state.assignments = []
    navigateTo("/curriculums/stream-subjects")
}

async function fetchRecord() {
    if (!state.streamId) return

    const list = await store.fetchAllByStream(state.streamId, 0, 0)

    if (list && list.length) {
        state.assignments = list.map((e: StreamSubject) => ({
            subjectId: e.subjectId,
            groupId: e.groupId,
            mandatory: e.mandatory
        }))
    } else {
        state.assignments = []
        add()
    }

    const groupRes = await subjectGroupStore.fetchAllByStream(state.streamId)

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

        await store.create(state.streamId, {
            assignments: state.assignments
        })

        toast.add({
            title: 'Success',
            description: 'Stream subjects assign successfully',
            color: 'success'
        })

        navigateTo('/curriculums/stream-subjects')

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
    streamStore.fetchAll(0, 0)
    useAppStore().setTitle('Assign Stream Subject')
    document.title = 'Stream Subjects | Assign Stream Subject | Skultem'
})

definePageMeta({
    role: [Role.SCHOOL_ADMIN]
})
</script>