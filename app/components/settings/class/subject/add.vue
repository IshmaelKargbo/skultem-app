<template>
    <u-slideover :dismissible="false" fu title="Add Class Subject" :open="open" @update:open="open = $event">
        <!-- Trigger button -->
        <UButton color="primary" label="Add Class Subject" icon="prime:plus" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Class Subject</p>
                <u-button icon="codicon:close" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body / Form -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit.prevent="onSubmit">
                <UFormField required label="Class" name="classId">
                    <USelect :items="classes" v-model="state.classId" placeholder="Select a class"
                        :disabled="isLoading" />
                    <template #hint>
                        <p class="text-xs text-muted">
                            Choose the class you want to assign subjects to.
                        </p>
                    </template>
                </UFormField>

                <UFormField required label="Subjects" name="subjects">
                    <USelect :items="subjects" multiple v-model="state.assignments"
                        placeholder="Select one or more subjects" :disabled="isLoading" />
                    <template #hint>
                        <p class="text-xs text-muted">
                            You can select multiple subjects to add to this class.
                        </p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <u-button icon="mynaui:save" :loading="isLoading" label="Save" @click="formRef?.submit()" />
                <u-button label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
            </div>
        </template>
    </u-slideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

const subjectStore = useSubjectStore()
const classStore = useClassSessionStore()
const store = useClassSessionStore()
const toast = useToast()
const isLoading = ref(false)

type SubjectForm = {
    classId: string
    assignments: string[]
}

const classes = computed(() => classStore.records.map((e: ClassSession) => {
    let label = `${e.clazz} (${e.sectionName})`

    if (e.streamName != "N/A") {
        label = `${e.clazz} (${e.sectionName} - ${e.streamName})`
    }
    return { label, value: e.clazzId }
}))

const subjects = computed(() =>
    subjectStore.records.map(s => ({
        label: s.name,
        value: s.id
    }))
)

const state = reactive<SubjectForm>({
    classId: '',
    assignments: []
})

const schema = yup.object({
    classId: yup
        .string()
        .required('Please select a class'),

    assignments: yup
        .array()
        .of(yup.string())
        .min(1, 'Select at least one subject')
        .required('Subjects are required')
})

const formRef = ref<any>(null)
const open = ref(false)

const close = () => {
    open.value = false
    state.classId = ''
    state.assignments = []
}

const onSubmit = async (event: FormSubmitEvent<SubjectForm>) => {
    event.preventDefault()
    isLoading.value = true

    try {
        await schema.validate(state, { abortEarly: false })
        // await store.create(state.classId, )

        await subjectStore.fetchAll()
        toast.add({ description: 'Subject created successfully', color: 'success' })
        close()
    } catch (err: any) {
        toast.add({ description: err.message, color: 'error' })
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    subjectStore.fetchAll(0, 0)
    classStore.fetchAll(0, 0)
})
</script>
