<template>
    <USlideover v-model:open="open">
        <!-- Trigger -->
        <UButton variant="subtle" color="info" label="Assign Class" icon="hugeicons:assignments" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Assign Class</p>
                <UButton icon="codicon:close" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body / Form -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit="onSubmit">
                <!-- Class Select -->
                <UFormField label="Class" name="classId" required>
                    <USelect :items="classes" v-model="state.classId" @change="fetchRecords" :disabled="isLoading"
                        placeholder="Select class" />
                    <template #hint>
                        <p class="text-xs text-muted">
                            Select the class to assign students to.
                        </p>
                    </template>
                </UFormField>

                <!-- Section Select -->
                <UFormField v-if="selectedClass" label="Section" name="sectionId" required>
                    <USelect :items="sections" v-model="state.sectionId" :disabled="isLoading"
                        placeholder="Select section" />
                    <template #hint>
                        <p class="text-xs text-muted">
                            Select the academic section of this class.
                        </p>
                    </template>
                </UFormField>

                <!-- Stream Select (for SSS level) -->
                <UFormField v-if="selectedClass?.level === Level.SSS" label="Stream" name="streamId" required>
                    <USelect :items="streams" v-model="state.streamId" :disabled="isLoading"
                        placeholder="Select stream" />
                    <template #hint>
                        <p class="text-xs text-muted">Select the stream for SSS level.</p>
                    </template>
                </UFormField>

                <!-- Students Multi-Select -->
                <UFormField v-if="selectedClass" label="Students" name="students" required>
                    <USelect :items="students" v-model="state.students" multiple :disabled="isLoading"
                        placeholder="Select students" />
                    <template #hint>
                        <p class="text-xs text-muted">
                            Select one or more students to assign to this class.
                        </p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <UButton icon="mynaui:save" :loading="isLoading" label="Save" variant="subtle"
                    @click="formRef?.submit()" />
                <UButton label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
            </div>
        </template>
    </USlideover>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import * as yup from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const store = useClassStore()
const studentStore = useStudentStore()
const toast = useToast()
const isLoading = ref(false)
const open = ref(false)
const formRef = ref<any>(null)

const state = reactive({
    classId: '',
    sectionId: '',
    streamId: '',
    students: [] as string[]
})

// Validation schema
const schema = yup.object({
    classId: yup.string().required('Class is required'),
    sectionId: yup.string().required('Section is required'),
    streamId: yup.string().when('classId', {
        is: (val: string) => store.records.find(c => c.id === val)?.level === 'SSS',
        then: schema => schema.required('Stream is required')
    }),
    students: yup.array().min(1, 'At least one student must be selected')
})

// Computed for dropdowns
const classes = computed(() =>
    store.records.map(c => ({ label: c.name, value: c.id }))
)

const selectedClass = computed(() =>
    store.records.find(c => c.id === state.classId) || null
)


async function fetchRecords() {
    try {
        if (state.classId == '') {
            return;
        }

        const result = await store.findAllSections(state.classId)
        if (result) {
            sections.value = result.map((s: ClassSection) => ({ label: s.section.name, value: s.id }))
        }

        const resultStreams = await store.findAllStreams(state.classId)
        if (result) {
            streams.value = resultStreams.map((s: ClassStream) => ({ label: s.stream.name, value: s.stream.id }))
        }

    } catch (err) {
        sections.value = []
    }

}
const sections = ref<{ label: string; value: string }[]>([])
const streams = ref<{ label: string; value: string }[]>([])

const students = computed(() =>
    studentStore.records.map(s => ({
        label: `${s.givenNames} ${s.familyName}`,
        value: s.id
    }))
)

// Close form
const close = () => {
    open.value = false
    state.classId = ''
    state.sectionId = ''
    state.streamId = ''
    state.students = []
}

// Submit
const onSubmit = async (event: FormSubmitEvent<typeof state>) => {
    isLoading.value = true
    try {
        await schema.validate(state, { abortEarly: false })
        await store.assignStudentClass({
            classId: state.classId,
            sectionId: state.sectionId,
            streamId: state.streamId,
            students: state.students
        })
        toast.add({ description: 'Students assigned to class successfully', color: 'success' })
        close()
    } catch (err: any) {
        toast.add({ description: err.message || 'Something went wrong', color: 'error' })
    } finally {
        isLoading.value = false
    }
}

onMounted(async () => {
    await store.fetchAll()
    await studentStore.fetchAll()
})
</script>
