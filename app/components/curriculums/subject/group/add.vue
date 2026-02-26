<template>
    <u-slideover title="Add Subject Group" :open="open" @update:open="open = $event">

        <UButton color="primary" label="Add Subject Group" icon="prime:plus" @click="open = true" />

        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Subject Group</p>
                <u-button icon="codicon:close" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit="onSubmit">

                <!-- Name -->
                <UFormField required label="Group Name" name="name">
                    <UInput v-model="state.name" placeholder="e.g. Core Subjects" :disabled="isLoading" />
                </UFormField>

                <!-- Level -->
                <UFormField required label="Level" name="level">
                    <USelect v-model="state.level" :items="levels" placeholder="Select Level" />
                </UFormField>

                <!-- Class -->
                <UFormField v-if="state.level && state.level !== Level.SSS" required label="Class" name="classId">
                    <USelect v-model="state.classId" :items="classes" placeholder="Select class" />
                </UFormField>

                <!-- Stream -->
                <UFormField v-if="state.level === Level.SSS" required label="Stream" name="streamId">
                    <USelect v-model="state.streamId" :items="streams" placeholder="Select Stream" />
                </UFormField>

                <!-- Required -->
                <UFormField name="required">
                    <div class="flex justify-between w-full py-2.5">
                        <div>
                            <p class="font-medium">Is Required?</p>
                            <p class="text-xs text-muted">
                                Enable if students must choose from this group.
                            </p>
                        </div>
                        <USwitch v-model="state.required" :disabled="isLoading" />
                    </div>
                </UFormField>

                <!-- Min Selection -->
                <UFormField required label="Minimum Selection" name="minSelection">
                    <UInput type="number" v-model.number="state.minSelection" placeholder="e.g. 1" />
                </UFormField>

                <!-- Max Selection -->
                <UFormField required label="Maximum Selection" name="maxSelection">
                    <UInput type="number" v-model.number="state.maxSelection" placeholder="e.g. 3" />
                </UFormField>

                <!-- Display Order -->
                <UFormField label="Display Order" name="displayOrder">
                    <UInput type="number" v-model.number="state.displayOrder" placeholder="Optional" />
                </UFormField>

            </UForm>
        </template>

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
import { reactive, ref, onMounted } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

const store = useSubjectGroupStore()
const classStore = useClassStore()
const streamStore = useStreamStore()
const toast = useToast()
const isLoading = ref(false)

const open = ref(false)
const formRef = ref<any>(null)

const streams = computed(() =>
    streamStore.records.map(s => ({
        label: s.name,
        value: s.id
    }))
)

const classes = computed(() =>
    classStore.records.filter(e => (e.level.toLowerCase() == state.level?.toLowerCase())).map(s => ({
        label: s.name,
        value: s.id
    }))
)

type SubjectGroupForm = {
    name: string
    level: Level | null
    classId: string
    streamId: string
    required: boolean
    minSelection: number | null
    maxSelection: number | null
    displayOrder: number | null
}

const state = reactive<SubjectGroupForm>({
    name: '',
    level: null,
    streamId: '',
    required: false,
    classId: '',
    minSelection: null,
    maxSelection: null,
    displayOrder: null
})

const schema = yup.object({
    name: yup.string().required('Group name is required'),
    level: yup
        .mixed<Level>()
        .required('Level is required'),
    streamId: yup.string()
        .nullable()
        .when('level', {
            is: (val: Level) => val === Level.SSS,
            then: schema =>
                schema.required('Stream is required for SSS'),
            otherwise: schema =>
                schema.nullable()
        }),
    classId: yup.string()
        .nullable()
        .when('level', {
            is: (val: Level) => val !== Level.SSS,
            then: schema =>
                schema.required('Class is required for Primary of JSS'),
            otherwise: schema =>
                schema.nullable()
        }),
    minSelection: yup
        .number()
        .typeError('Min must be a number')
        .required('Min selection is required')
        .min(0),
    maxSelection: yup
        .number()
        .typeError('Max must be a number')
        .required('Max selection is required')
        .min(
            yup.ref('minSelection'),
            'Max must be greater than or equal to Min'
        )
})

const close = () => {
    open.value = false
    Object.assign(state, {
        name: '',
        level: '',
        streamId: '',
        required: false,
        minSelection: null,
        maxSelection: null,
        displayOrder: null
    })
}

const onSubmit = async (event: FormSubmitEvent<SubjectGroupForm>) => {
    isLoading.value = true
    try {
        await schema.validate(state, { abortEarly: false })

        await store.create({
            displayOrder: state.displayOrder || 1,
            level: state.level?.toUpperCase() || '',
            maxSelection: state.maxSelection || 1,
            minSelection: state.minSelection || 1,
            name: state.name,
            classId: state.classId,
            required: state.required,
            streamId: state.streamId
        })

        toast.add({
            description: 'Subject Group created successfully',
            color: 'success'
        })

        store.fetchAll(1, runtimeConf().limit)
        close()
    } catch (err: any) {
        toast.add({
            description: err.message,
            color: 'error'
        })
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    streamStore.fetchAll(0, 0)
    classStore.fetchAll(0, 0)
})
</script>