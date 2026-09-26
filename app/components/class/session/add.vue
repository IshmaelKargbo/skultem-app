<template>
    <USlideover :dismissible="false" v-model:open="open">
        <UButton class="hidden md:flex" color="primary" label="Create Class Session" :icon="ADD_ICON" @click="open = true" />
        <UButton class="md:hidden" color="primary" :icon="ADD_ICON" @click="open = true" />

        <template #header>
            <div class="flex w-full items-center justify-between gap-3">
                <p class="text-lg font-semibold">Create Class Session</p>
                <UButton icon="lucide:x" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" :disabled="isLoading" class="w-full space-y-4 sm:space-y-5"
                @submit="onSubmit">
                <!-- Academic Year -->
                <UFormField label="Academic Year" name="academicYear" required>
                    <USelectMenu v-model="state.academicYear" value-key="value" :items="academicYearStore.list"
                        placeholder="Select academic year" :disabled="isLoading">
                        <template #leading>
                            <UIcon name="i-lucide-calendar-range" class="text-muted" />
                        </template>
                    </USelectMenu>

                    <template #help>
                        <p class="text-xs text-muted">
                            Which academic year is this class session for. Pick a future year to prepare it ahead of time.
                        </p>
                    </template>
                </UFormField>

                <!-- Class -->
                <UFormField label="Class" name="classId" required>
                    <USelectMenu v-model="state.classId" value-key="value" :items="classes" placeholder="Select class"
                        :disabled="isLoading">
                        <template #leading>
                            <UIcon name="i-lucide-school" class="text-muted" />
                        </template>
                    </USelectMenu>
                </UFormField>

                <!-- Section -->
                <UFormField v-if="state.classId" label="Section" name="sectionId" required>
                    <USelectMenu v-model="state.sectionId" value-key="value" :items="sections" placeholder="Select section"
                        :disabled="isLoading || sections.length === 0">
                        <template #leading>
                            <UIcon name="i-lucide-layout-grid" class="text-muted" />
                        </template>
                    </USelectMenu>

                    <template #help>
                        <p v-if="!sections.length" class="text-xs text-warning">
                            The school has no sections yet - add them under Classes › Sections.
                        </p>
                    </template>
                </UFormField>

                <!-- Stream -->
                <UFormField v-if="levelInfo(selectedClass?.level)?.streamed" label="Stream" name="streamId" required>
                    <USelectMenu v-model="state.streamId" value-key="value" :items="streams" placeholder="Select stream"
                        :disabled="isLoading || streams.length === 0">
                        <template #leading>
                            <UIcon name="i-lucide-git-branch-plus" class="text-muted" />
                        </template>
                    </USelectMenu>

                    <template #help>
                        <p class="text-xs text-muted">Required for SSS classes.</p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <template #footer>
            <div class="flex flex-col gap-3 sm:flex-row">
                <UButton class="justify-center" icon="lucide:save" :loading="isLoading" label="Save"
                    @click="formRef?.submit()" />
                <UButton class="justify-center" label="Cancel" variant="outline" color="neutral" @click="close"
                    :disabled="isLoading" />
            </div>
        </template>
    </USlideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const { defaultAcademicYearId } = defineProps<{
    defaultAcademicYearId?: string
}>()

const emit = defineEmits<{ created: [] }>()

const classStore = useClassStore()
const sessionStore = useClassSessionStore()
const academicYearStore = useAcademicYearStore()
const toast = useNotify()

const isLoading = ref(false)
const open = ref(false)
const formRef = ref<any>(null)

const state = reactive({
    academicYear: '',
    classId: '',
    sectionId: '',
    streamId: ''
})

const schema = yup.object({
    academicYear: yup.string().required('Academic year is required'),
    classId: yup.string().required('Class is required'),
    sectionId: yup.string().required('Section is required')
})

const classes = computed(() => classStore.records.map((c) => ({ label: c.name, value: c.id })))

const selectedClass = computed(() => classStore.records.find((c) => c.id === state.classId) || null)

const sections = ref<{ label: string, value: string }[]>([])
const streams = ref<{ label: string, value: string }[]>([])

// Any of the school's sections / streams can be added to a class - the backend links one the class
// doesn't have yet (e.g. adding SSS 1 Art section B later), so this isn't limited to what the class
// was created with.
const sectionStore = useSectionStore()
const streamStore = useStreamStore()

async function fetchDependents() {
    state.sectionId = ''
    state.streamId = ''
    sections.value = []
    streams.value = []

    if (!state.classId) return

    try {
        if (!sectionStore.records.length) await sectionStore.fetchAll()
        sections.value = sectionStore.records.map(s => ({ label: s.name, value: s.id }))

        if (levelInfo(selectedClass.value?.level)?.streamed) {
            if (!streamStore.records.length) await streamStore.fetchAll()
            streams.value = streamStore.records.map(s => ({ label: s.name, value: s.id }))
        }
    } catch {
        sections.value = []
        streams.value = []
    }
}

const close = () => {
    open.value = false
    state.classId = ''
    state.sectionId = ''
    state.streamId = ''
    sections.value = []
    streams.value = []
}

const onSubmit = async (event: FormSubmitEvent<typeof state>) => {
    isLoading.value = true
    try {
        await sessionStore.create({
            classId: state.classId,
            academicYear: state.academicYear,
            sectionId: state.sectionId,
            streamId: state.streamId || undefined
        })

        toast.success('Class session created successfully.')
        emit('created')
        close()
    } catch (err: any) {
        toast.error(err.message || 'Something went wrong')
    } finally {
        isLoading.value = false
    }
}

watch(() => state.classId, fetchDependents)

watch(open, (val) => {
    if (val) {
        state.academicYear = defaultAcademicYearId || academicYearStore.list[0]?.value || ''
        classStore.fetchAll(1, 100)
        academicYearStore.fetchAll(1, 100)
    }
})
</script>
