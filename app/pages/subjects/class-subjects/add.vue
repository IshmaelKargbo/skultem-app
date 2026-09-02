<template>
    <UForm class="p-4 sm:p-6 space-y-4 pb-24 md:pb-4" :state="state" :schema="schema" @submit="onSubmit">
        <!-- Header -->
        <Heading title="Assign Subjects to Class" subtitle="Define the curriculum structure for this class.">
            <UFormField class="w-full md:w-auto md:min-w-sm" name="classId">
                <USelectMenu value-key="value" :loading="classStore.loading" v-model="state.classId"
                    @change="fetchRecord" :items="classes" placeholder="Choose a class" class="w-full" />
            </UFormField>
        </Heading>

        <!-- Assignments card (shown only when a class is selected) -->
        <UCard v-if="state.classId" :ui="{
            body: 'sm:p-0'
        }">
            <template #header>
                <div>
                    <div v-if="lockedCount > 0" role="status" aria-live="polite"
                        class="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                        <UIcon name="lucide:lock" class="mt-0.5 size-3.5 shrink-0" />
                        <span>
                            {{ lockedCount }} subject(s) are locked because student assessments already have grades.
                            Locked rows are view-only.
                        </span>
                    </div>
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-200">
                            Subject Assignments
                            <span
                                class="ml-1 inline-flex items-center justify-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                {{ state.assignments.length }}
                            </span>
                        </h3>
                        <UButton variant="subtle" color="primary" icon="prime:plus" label="Add Subject"
                            class="w-full justify-center sm:w-auto" @click="add" />
                    </div>
                </div>
            </template>

            <!-- Desktop / tablet: table -->
            <div class="hidden md:block">
                <UTable :columns="columns" :loading="store.loading" :data="state.assignments">
                    <!-- # column -->
                    <template #index-cell="{ row }">
                        <span class="text-sm text-gray-400 tabular-nums">{{ row.index + 1 }}</span>
                    </template>

                    <!-- Subject column -->
                    <template #subjectId-cell="{ row }">
                        <UFormField :name="`assignments.${row.index}.subjectId`">
                            <USelectMenu value-key="value" :items="availableSubjects(row.index)"
                                :loading="subjectStore.loading" placeholder="Select Subject" class="w-full"
                                v-model="row.original.subjectId" :disabled="Boolean(row.original.locked)" />
                        </UFormField>
                    </template>

                    <!-- Group column -->
                    <template #groupId-cell="{ row }">
                        <UFormField :name="`assignments.${row.index}.groupId`">
                            <USelectMenu value-key="value" :items="groups" :loading="subjectGroupStore.loading"
                                placeholder="Select Group (Optional)" class="w-full" v-model="row.original.groupId"
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
                            <UButton v-if="showDelete() && !row.original.locked" @click="remove(row.index)"
                                variant="ghost" color="error" icon="lucide:trash-2"
                                :aria-label="`Remove subject ${row.index + 1}`" />
                            <UBadge v-else-if="row.original.locked" color="neutral" variant="outline" label="Locked" />
                        </div>
                    </template>

                    <!-- Empty state -->
                    <template #empty>
                        <div class="border border-dashed border-gray-300 rounded-lg p-10 text-center">
                            <UIcon name="lucide:book-open" class="mx-auto mb-3 size-8 text-gray-300" />
                            <p class="text-sm text-gray-500 mb-4">No subjects assigned yet.</p>
                            <UButton icon="prime:plus" label="Add First Subject" @click="add" />
                        </div>
                    </template>
                </UTable>
            </div>

            <!-- Mobile: stacked cards, one per assignment -->
            <div class="md:hidden">
                <div v-if="!state.assignments.length"
                    class="border border-dashed border-gray-300 rounded-lg m-4 p-10 text-center">
                    <UIcon name="lucide:book-open" class="mx-auto mb-3 size-8 text-gray-300" />
                    <p class="text-sm text-gray-500 mb-4">No subjects assigned yet.</p>
                    <UButton icon="prime:plus" label="Add First Subject" @click="add" />
                </div>

                <TransitionGroup v-else tag="div" name="row" class="divide-y divide-gray-200 dark:divide-gray-800">
                    <div v-for="(assignment, index) in state.assignments" :key="index" class="py-4 space-y-3">
                        <div class="flex items-center justify-between">
                            <span
                                class="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                <UIcon v-if="assignment.locked" name="lucide:lock" class="size-3" />
                                Subject {{ index + 1 }}
                            </span>
                            <UBadge v-if="assignment.locked" color="neutral" variant="outline" label="Locked" />
                            <UButton v-else-if="showDelete()" @click="remove(index)" variant="ghost" color="error"
                                icon="lucide:trash-2" size="xs" :aria-label="`Remove subject ${index + 1}`" />
                        </div>

                        <UFormField :name="`assignments.${index}.subjectId`" label="Subject">
                            <USelectMenu value-key="value" :items="availableSubjects(index)"
                                :loading="subjectStore.loading" placeholder="Select Subject" class="w-full"
                                v-model="assignment.subjectId" :disabled="Boolean(assignment.locked)" />
                        </UFormField>

                        <UFormField :name="`assignments.${index}.groupId`" label="Group">
                            <USelectMenu value-key="value" :items="groups" :loading="subjectGroupStore.loading"
                                placeholder="Select Group (Optional)" class="w-full" v-model="assignment.groupId"
                                :disabled="disableByLevel || Boolean(assignment.locked)" />
                        </UFormField>

                        <div class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900">
                            <span class="text-sm text-gray-600 dark:text-gray-300">Mandatory</span>
                            <USwitch v-model="assignment.mandatory"
                                :disabled="disableByLevel || Boolean(assignment.locked)" />
                        </div>
                    </div>
                </TransitionGroup>
            </div>

            <div v-if="state.assignments.length"
                class="flex flex-wrap items-center gap-x-4 gap-y-1 p-4 bg-gray-50 dark:bg-gray-950 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
                <span>Total Subjects: <strong class="text-gray-800 dark:text-gray-200">{{ state.assignments.length
                        }}</strong></span>
                <span>Core: <strong class="text-gray-800 dark:text-gray-200">{{state.assignments.filter(a =>
                        a.mandatory).length}}</strong></span>
                <span>Optional: <strong class="text-gray-800 dark:text-gray-200">{{state.assignments.filter(a =>
                        !a.mandatory).length}}</strong></span>
            </div>

            <template #footer>
                <div class="flex flex-col gap-3 sm:flex-row">
                    <UButton type="submit" color="primary" icon="lucide:save" label="Save Changes" :loading="saving"
                        class="w-full justify-center sm:w-auto" />
                    <UButton color="neutral" variant="outline" label="Cancel" @click="resetForm"
                        class="w-full justify-center sm:w-auto" />
                </div>
            </template>
        </UCard>
        <UCard v-else>
            <div class="h-56 flex flex-col items-center justify-center gap-3 px-4 text-center">
                <div class="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800">
                    <UIcon :name="EMPTY_ICON" class="w-6 h-6 text-gray-400" />
                </div>
                <div class="space-y-1">
                    <p class="text-sm font-medium text-gray-600 dark:text-gray-300">No Class Selected</p>
                    <p class="text-xs text-gray-400">
                        Choose a class from the dropdown above to manage its subject assignments.
                    </p>
                </div>
            </div>
        </UCard>

        <!-- Sticky action bar on mobile so Save/Cancel stay reachable with long lists -->
        <div v-if="state.classId"
            class="fixed inset-x-0 bottom-0 z-10 flex gap-3 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-sm md:hidden dark:border-gray-800 dark:bg-gray-950/95"
            style="padding-bottom: max(1rem, env(safe-area-inset-bottom));">
            <UButton color="neutral" variant="outline" label="Cancel" class="flex-1 justify-center"
                @click="resetForm" />
            <UButton type="submit" color="primary" icon="lucide:save" label="Save Changes" :loading="saving"
                class="flex-1 justify-center" @click="onSubmit" />
        </div>
    </UForm>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import * as yup from 'yup'

const view = ref<'table' | 'card'>('table')
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
    classStore.records.map(e => {
        let section = e.sectionName

        if (e.streamName) {
            section = section ? `${section} - ${e.streamName}` : e.streamName
        }
        
        return {
            label: `${e.clazz} ${section ? `(${section})` : ''}`,
            value: e.id
        }
    })
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
    { id: 'index', header: '#' },
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
    navigateTo('/subjects/class-subjects')
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
        navigateTo('/subjects/class-subjects')
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
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.TEACHER]
})
</script>

<style scoped>
.row-enter-active,
.row-leave-active {
    transition: opacity 0.18s ease, transform 0.18s ease;
}

.row-enter-from {
    opacity: 0;
    transform: translateY(-6px);
}

.row-leave-to {
    opacity: 0;
    transform: translateX(12px);
}

.row-leave-active {
    position: absolute;
    width: 100%;
}

@media (prefers-reduced-motion: reduce) {

    .row-enter-active,
    .row-leave-active {
        transition: none !important;
    }
}
</style>