<template>
    <UModal v-model:open="open">
        <UButton :icon="CLASS_ICON" color="neutral" variant="outline" size="sm" label="Change Class"
            @click="onOpen" />

        <template #content>
            <UCard>
                <template #header>
                    <div>
                        <h3 class="text-lg font-semibold">Change Class</h3>
                        <p class="text-sm text-muted">
                            Correct the class {{ studentName }} was placed in by mistake.
                        </p>
                    </div>
                </template>

                <div v-if="loadingEnrollment" class="space-y-3">
                    <USkeleton class="h-4 w-48" />
                    <USkeleton class="h-9 w-full" />
                </div>

                <div v-else-if="!enrollment" class="text-sm text-muted">
                    This student has no enrollment in the current academic year to change.
                </div>

                <div v-else class="space-y-5">
                    <UAlert color="warning" variant="soft" icon="i-lucide-alert-triangle"
                        title="This replaces the student's class data"
                        description="Subjects, assessments and fee charges from the current class are removed and set up again for the new class. It isn't possible once attendance, scores, behaviour, discounts or payments have been recorded." />

                    <p class="text-sm">
                        Current class:
                        <span class="font-medium text-highlighted">{{ currentLabel }}</span>
                    </p>

                    <UFormField label="New class" required>
                        <USelectMenu v-model="selectedSession" :items="sessionOptions" value-key="value"
                            :loading="classSession.loading" :disabled="saving" placeholder="Select the correct class"
                            class="w-full" />
                    </UFormField>

                    <div v-if="loadingSubjects" class="space-y-2">
                        <USkeleton class="h-4 w-40" />
                        <USkeleton class="h-9 w-full" />
                    </div>

                    <template v-else-if="selectedSession">
                        <p class="text-sm text-muted">
                            {{ coreCount }} required subject{{ coreCount === 1 ? '' : 's' }} will be assigned
                            automatically.
                        </p>

                        <div v-for="group in optionalGroups" :key="group.id" class="space-y-2">
                            <div class="flex items-center justify-between">
                                <p class="text-sm font-medium">{{ group.name }}</p>
                                <UBadge variant="soft" color="neutral"
                                    :label="group.select > 1 ? `Select ${group.select}` : 'Select one'" />
                            </div>

                            <UCheckboxGroup v-if="group.select > 1" v-model="pickedMany[group.id]"
                                :items="group.subjects" value-key="value" :disabled="saving" />
                            <URadioGroup v-else v-model="pickedOne[group.id]" :items="group.subjects"
                                value-key="value" variant="card" :disabled="saving" />
                        </div>
                    </template>
                </div>

                <template #footer>
                    <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <UButton label="Cancel" variant="soft" color="neutral" :disabled="saving"
                            @click="open = false" />
                        <UButton label="Change class" :icon="CLASS_ICON" :loading="saving"
                            :disabled="!canSubmit" @click="submit" />
                    </div>
                </template>
            </UCard>
        </template>
    </UModal>
</template>

<script setup lang="ts">
interface OptionalGroup {
    id: string
    name: string
    select: number
    subjects: { label: string, description?: string, value: string }[]
}

const props = defineProps<{
    studentId: string
    studentName: string
}>()

const emit = defineEmits<{ changed: [] }>()

const store = useStudentStore()
const classSession = useClassSessionStore()
const subjectStore = useClassSubjectStore()
const { success, error } = useNotify()

const open = ref(false)
const saving = ref(false)
const loadingEnrollment = ref(false)
const loadingSubjects = ref(false)

const enrollment = ref<Enrollment | null>(null)
const selectedSession = ref<string | undefined>()
const coreCount = ref(0)
const optionalGroups = ref<OptionalGroup[]>([])
const pickedOne = reactive<Record<string, string>>({})
const pickedMany = reactive<Record<string, string[]>>({})

function isCurrent(session: any) {
    const e = enrollment.value
    if (!e) return false

    return session.clazzId === e.clazz?.id
        && session.sectionId === e.section?.id
        && (session.streamId || null) === (e.stream?.id || null)
}

const sessionOptions = computed(() =>
    classSession.records
        .filter((session: any) => !isCurrent(session))
        .map((session: any) => ({ label: parseClassSession(session), value: session.id }))
)

const currentLabel = computed(() => {
    const e = enrollment.value
    if (!e) return ''

    return [e.clazz?.name, e.section?.name, e.stream?.name].filter(Boolean).join(' - ')
})

const chosen = computed(() => classSession.records.find((s: any) => s.id === selectedSession.value) as any)

function pickedFor(group: OptionalGroup): string[] {
    return group.select > 1 ? (pickedMany[group.id] || []) : (pickedOne[group.id] ? [pickedOne[group.id]!] : [])
}

const optionalSelectionComplete = computed(() =>
    optionalGroups.value.every(group => pickedFor(group).length === group.select)
)

const canSubmit = computed(() =>
    !!enrollment.value && !!selectedSession.value && !loadingSubjects.value && optionalSelectionComplete.value
)

async function onOpen() {
    open.value = true
    selectedSession.value = undefined
    loadingEnrollment.value = true

    try {
        const [current] = await Promise.all([
            store.findEnrollmentByStudent(props.studentId),
            classSession.fetchAll(0, 0)
        ])
        enrollment.value = current || null
    } catch (err: any) {
        enrollment.value = null
        error(err?.message || 'Failed to load the student\'s enrollment')
    } finally {
        loadingEnrollment.value = false
    }
}

watch(selectedSession, async () => {
    coreCount.value = 0
    optionalGroups.value = []
    Object.keys(pickedOne).forEach(key => delete pickedOne[key])
    Object.keys(pickedMany).forEach(key => delete pickedMany[key])

    const session = chosen.value
    if (!session) return

    loadingSubjects.value = true
    try {
        const subjects: any[] = session.streamId
            ? await subjectStore.fetchAllByClassAndStream(session.clazzId, session.streamId, 0, 0)
            : await subjectStore.fetchAllByClass(session.clazzId, 0, 0)

        const groups = new Map<string, OptionalGroup>()
        for (const subject of subjects || []) {
            if (!subject.groupId || subject.groupName === 'N/A') {
                coreCount.value++
                continue
            }

            if (!groups.has(subject.groupId)) {
                groups.set(subject.groupId, { id: subject.groupId, name: subject.groupName, select: subject.select, subjects: [] })
            }
            groups.get(subject.groupId)!.subjects.push({
                label: subject.subjectName,
                description: subject.teacherName,
                value: subject.subjectId
            })
        }

        optionalGroups.value = Array.from(groups.values())
        for (const group of optionalGroups.value) {
            if (group.select > 1) pickedMany[group.id] = []
        }
    } finally {
        loadingSubjects.value = false
    }
})

async function submit() {
    const session = chosen.value
    if (!enrollment.value || !session) return

    saving.value = true
    try {
        await store.changeClass(
            props.studentId,
            enrollment.value.id,
            {
                classId: session.clazzId,
                sectionId: session.sectionId,
                streamId: session.streamId || undefined
            },
            optionalGroups.value.flatMap(pickedFor)
        )

        success('Student class changed successfully')
        open.value = false
        emit('changed')
    } catch (err: any) {
        error(err?.message || 'Failed to change class')
    } finally {
        saving.value = false
    }
}
</script>
