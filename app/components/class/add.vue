<template>
    <USlideover :dismissible="false" :open="open" @update:open="open = $event">
        <!-- Trigger -->
        <UButton color="primary" label="Add Class" :icon="ADD_ICON" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Class</p>
                <UButton :icon="CLOSE_ICON" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit.prevent="onSubmit">
                <!-- Name -->
                <UFormField required label="Name" name="name">
                    <UInput v-model="state.name" placeholder="e.g. Class 1" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Enter the name of the class. This will be used for display and identification.
                        </p>
                    </template>
                </UFormField>

                <!-- Level -->
                <UFormField required label="Level" name="level">
                    <USelectMenu value-key="value" v-model="state.level" :items="levels"
                        placeholder="Select class level" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Select the education level for this class, e.g., JSS, SSS.
                        </p>
                    </template>
                </UFormField>

                <!-- Stream (Only for SSS) -->
                <UFormField v-if="state.level === Level.SSS" required label="Stream" name="streams">
                    <USelectMenu value-key="value" v-model="state.streams" :items="streams" multiple
                        placeholder="Select stream" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Assign one or more streams for SSS classes. Streams differentiate student groups within the
                            same level.
                        </p>
                    </template>
                </UFormField>

                <!-- Sections -->
                <UFormField required label="Sections" name="sections">
                    <USelectMenu value-key="value" v-model="state.sections" :items="sections" multiple
                        placeholder="Select sections" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Select one or more sections for this class. Sections help organize students into smaller
                            groups.
                        </p>
                    </template>
                </UFormField>

                <!-- Grade -->
                <UFormField required label="Grade" name="levelOrder">
                    <UInput v-model="state.levelOrder" type="number" placeholder="e.g. 1" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            The display order of the class. Lower numbers appear first in lists.
                        </p>
                    </template>
                </UFormField>

                <!-- Assessment Template -->
                <UFormField label="Assessment Template" name="assessmentTemplateId">
                    <USelectMenu value-key="value" v-model="state.assessmentTemplateId" :items="assessmentTemplates"
                        placeholder="Select assessment template (optional)"
                        :disabled="isLoading || assessmentStore.loading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Optional. Select a template that will be used when provisioning assessments for students in
                            this class.
                        </p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex gap-3">
                <UButton :icon="SAVE_ICON" label="Save" :loading="isLoading" @click="formRef?.submit()" />
                <UButton label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
            </div>
        </template>
    </USlideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref, computed, watch, onMounted } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

const store = useClassStore()
const streamStore = useStreamStore()
const sectionStore = useSectionStore()
const assessmentStore = useAssessmentStore()
const { error: toastError, success: toastSuccess } = useNotify()

const open = ref(false)
const isLoading = ref(false)
const formRef = ref<any>(null)

const streams = computed(() =>
    streamStore.records.map(s => ({
        label: s.name,
        value: s.id
    }))
)

const sections = computed(() =>
    sectionStore.records.map(s => ({
        label: s.name,
        value: s.id
    }))
)

const assessmentTemplates = computed(() =>
    assessmentStore.records.map((e) => ({
        label: e.name,
        value: e.id
    }))
)

type ClassForm = {
    name: string
    level: Level | ''
    sections: string[]
    streams: string[]
    levelOrder: number | null
    assessmentTemplateId: string
}

const state = reactive<ClassForm>({
    name: '',
    level: '',
    sections: [],
    streams: [],
    levelOrder: null,
    assessmentTemplateId: ''
})

const schema = yup.object({
    name: yup.string().required('Name is required'),
    level: yup.mixed<Level>().required('Level is required'),
    sections: yup.array().of(yup.string()).min(1, 'At least one section is required'),
    streams: yup.array().when('level', {
        is: Level.SSS,
        then: schema =>
            schema.of(yup.string()).min(1, 'At least one stream is required for SSS'),
        otherwise: schema => schema.notRequired()
    }),
    levelOrder: yup.number().typeError('Grade must be a number').required('Grade is required').min(1)
})

watch(
    () => state.level,
    (val) => {
        if (val !== Level.SSS) state.streams = []
    }
)

const close = () => {
    open.value = false
    state.name = ''
    state.level = ''
    state.sections = []
    state.streams = []
    state.levelOrder = null
    state.assessmentTemplateId = ''
}

const onSubmit = async (event: FormSubmitEvent<ClassForm>) => {
    isLoading.value = true
    try {
        await store.create({
            name: state.name,
            level: state.level as Level,
            sections: state.sections,
            streams: state.streams,
            levelOrder: state.levelOrder as number,
            assessmentTemplateId: state.assessmentTemplateId || undefined
        })
        toastSuccess('Class created successfully')
        await useClassSessionStore().fetchAll(1, runtimeConf().limit)
        close()
    } catch (err: any) {
        toastError(err?.message || 'Something went wrong')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    streamStore.fetchAll()
    sectionStore.fetchAll()
    assessmentStore.fetchAll(1, 0)
})
</script>