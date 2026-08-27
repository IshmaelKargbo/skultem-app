<template>
    <u-slideover :dismissible="false" :title="isEdit ? 'Edit Academic Year' : 'Add Academic Year'" :open="open" @update:open="open = $event">
        <!-- Trigger button -->
        <UButton v-if="isEdit" :icon="EDIT_ICON" size="xs" color="neutral" variant="ghost" @click="open = true" />
        <template v-else>
            <UButton color="primary" label="Add Academic Year" class="hidden md:flex" :icon="ADD_ICON" @click="open = true" />
            <UButton color="primary" class="md:hidden" :icon="ADD_ICON" @click="open = true" />
        </template>

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">{{ isEdit ? 'Edit Academic Year' : 'Add Academic Year' }}</p>
                <u-button icon="lucide:x" variant="ghost"  color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body / Form -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit.prevent="onSubmit">
                <UFormField required label="Name" name="name">
                    <UInput v-model="state.name" placeholder="e.g. 2023/2024" :disabled="isLoading" />
                    <template #hint>
                        <p class="text-xs text-muted">Enter the academic year in the format YYYY/YYYY</p>
                    </template>
                </UFormField>

                <UFormField required label="Start Date" name="startDate" class="flex-1">
                    <UInput v-model="state.startDate" type="date" :disabled="isLoading" />
                    <template #hint>
                        <p class="text-xs text-muted">The first day of the academic year.</p>
                    </template>
                </UFormField>

                <UFormField required label="End Date" name="endDate" class="flex-1">
                    <UInput v-model="state.endDate" type="date" :disabled="isLoading" />
                    <template #hint>
                        <p class="text-xs text-muted">The last day of the academic year.</p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <u-button label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
                <u-button :trailing-icon="SAVE_ICON" :loading="isLoading" label="Save" @click="formRef?.submit()" />
            </div>
        </template>
    </u-slideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

const { year } = defineProps<{ year?: AcademicYear }>()

const store = useAcademicYearStore()
const { error: toastError, success: toastSuccess } = useNotify()
const isLoading = ref(false)
const isEdit = computed(() => !!year)

type AcademicYearForm = {
    name: string
    startDate: string
    endDate: string
}

function defaultState(): AcademicYearForm {
    return {
        name: year?.name || '',
        startDate: year?.startDate || '',
        endDate: year?.endDate || ''
    }
}

// reactive form state
const state = reactive<AcademicYearForm>(defaultState())

// yup validation schema
const schema = yup.object({
    name: yup.string().required('Name is required'),
    startDate: yup.string().required('Start date is required'),
    endDate: yup.string().required('End date is required')
})

const formRef = ref<any>(null)
const open = ref(false)

// reset form to whatever it should show next time it opens
const close = () => {
    open.value = false
    Object.assign(state, defaultState())
}


// handle submission
const onSubmit = async (event: FormSubmitEvent<AcademicYearForm>) => {
    event.preventDefault()
    isLoading.value = true

    try {
        await schema.validate(state, { abortEarly: false })

        if (isEdit.value && year) {
            await store.update(year.id, {
                name: state.name,
                startDate: state.startDate,
                endDate: state.endDate
            })
            toastSuccess('Academic year updated successfully')
        } else {
            await store.create({
                name: state.name,
                startDate: state.startDate,
                endDate: state.endDate
            })
            await store.fetchAll()
            toastSuccess('Academic year created successfully')
        }

        close()
    } catch (err: any) {
        toastError(err.message)
    } finally {
        isLoading.value = false
    }
}
</script>
