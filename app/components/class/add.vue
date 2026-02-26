<template>
    <USlideover :open="open" @update:open="open = $event">
        <!-- Trigger -->
        <UButton color="primary" label="Add Class" icon="prime:plus" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Class</p>
                <UButton icon="codicon:close" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <!-- Name -->
                <UFormField required label="Name" name="name">
                    <UInput v-model="state.name" placeholder="e.g. Class 1" :disabled="isLoading" />
                    <template #hint>
                        <p class="text-xs text-muted">
                            Enter the name of the class.
                        </p>
                    </template>
                </UFormField>

                <!-- Level -->
                <UFormField required label="Level" name="level">
                    <USelect v-model="state.level" :items="levels" placeholder="Select class level"
                        :disabled="isLoading" />
                </UFormField>

                <!-- Stream (Only for SSS) -->
                <UFormField v-if="state.level === Level.SSS" required label="Stream" name="streams">
                    <USelect v-model="state.streams" :items="streams" multiple placeholder="Select stream"
                        :disabled="isLoading" />
                </UFormField>

                <!-- Sections -->
                <UFormField required label="Sections" name="sections">
                    <USelect v-model="state.sections" :items="sections" multiple placeholder="Select sections"
                        :disabled="isLoading" />
                </UFormField>

                <!-- Level Order -->
                <UFormField required label="Level Order" name="levelOrder">
                    <UInput v-model="state.levelOrder" type="number" placeholder="e.g. 1" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Display order of the class.
                        </p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex gap-3">
                <UButton icon="mynaui:save" label="Save" :loading="isLoading" @click="formRef?.submit()" />
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
const toast = useToast()

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

type ClassForm = {
    name: string
    level: Level | ''
    sections: string[]
    streams: string[]
    levelOrder: number | null
}

const state = reactive<ClassForm>({
    name: '',
    level: '',
    sections: [],
    streams: [],
    levelOrder: null
})

const schema = yup.object({
    name: yup.string().required('Name is required'),

    level: yup
        .mixed<Level>()
        .required('Level is required'),

    sections: yup
        .array()
        .of(yup.string())
        .min(1, 'At least one section is required'),

    streams: yup.array().when('level', {
        is: Level.SSS,
        then: schema =>
            schema
                .of(yup.string())
                .min(1, 'At least one stream is required for SSS'),
        otherwise: schema => schema.notRequired()
    }),

    levelOrder: yup
        .number()
        .typeError('Level order must be a number')
        .required('Level order is required')
        .min(1)
})

watch(
    () => state.level,
    (val) => {
        if (val !== Level.SSS) {
            state.streams = []
        }
    }
)

const close = () => {
    open.value = false

    state.name = ''
    state.level = ''
    state.sections = []
    state.streams = []
    state.levelOrder = null
}

const onSubmit = async (event: FormSubmitEvent<ClassForm>) => {
    isLoading.value = true

    try {
        await store.create({
            name: state.name,
            level: state.level as Level,
            sections: state.sections,
            streams: state.streams,
            levelOrder: state.levelOrder as number
        })

        toast.add({
            description: 'Class created successfully',
            color: 'success'
        })

        await useClassSessionStore().fetchAll(1, runtimeConf().limit)
        close()

    } catch (err: any) {
        toast.add({
            description: err?.message || 'Something went wrong',
            color: 'error'
        })
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    streamStore.fetchAll()
    sectionStore.fetchAll()
})
</script>
