<template>
    <u-slideover title="Add Section" :open="open" @update:open="open = $event">
        <!-- Trigger button -->
        <UButton color="primary" label="Add Section" icon="prime:plus" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Section</p>
                <u-button icon="codicon:close" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body / Form -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit.prevent="onSubmit">
                <UFormField required label="Name" name="name">
                    <UInput v-model="state.name" placeholder="e.g. Section A" :disabled="isLoading" />
                    <template #hint>
                        <p class="text-xs text-muted">Enter the name of the section (e.g. Section A).</p>
                    </template>
                </UFormField>
                <UFormField required label="Description" name="description">
                    <UTextarea :items="classes" v-model="state.description" :disabled="isLoading"
                        placeholder="Enter description" />
                    <template #hint>
                        <p class="text-xs text-muted">Select the class for this section.</p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <u-button icon="mynaui:save" :loading="isLoading" label="Save"
                    @click="formRef?.submit()" />
                <u-button label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
            </div>
        </template>
    </u-slideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

const store = useSectionStore()
const classStore = useClassStore()
const classes = computed(() => classStore.records.map(c => ({ label: c.name, value: c.id })))
const toast = useToast()
const isLoading = ref(false)

type SectionForm = {
    name: string
    description: string
}

// reactive form state
const state = reactive<SectionForm>({
    name: '',
    description: '',
})

// yup validation schema
const schema = yup.object({
    name: yup.string().required('Name is required'),
    description: yup.string().required('Description is required')
})

const formRef = ref<any>(null)
const open = ref(false)

const close = () => {
    open.value = false
    state.name = ''
    state.description = ''
}

const onSubmit = async (event: FormSubmitEvent<SectionForm>) => {
    event.preventDefault()
    isLoading.value = true

    try {
        await schema.validate(state, { abortEarly: false })
        await store.create({
            name: state.name,
            description: state.description
        })

        await store.fetchAll()
        toast.add({ description: 'Section created successfully', color: 'success' })
        close()
    } catch (err: any) {
        toast.add({ description: err.message, color: 'error' })
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    store.fetchAll()
})
</script>
