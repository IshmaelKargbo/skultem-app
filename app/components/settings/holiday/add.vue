<template>
    <u-slideover :dismissible="false" title="Add Holiday" :open="open" @update:open="open = $event">

        <!-- Trigger -->
        <UButton color="primary" label="Add Holiday" icon="prime:plus" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Holiday</p>
                <UButton icon="lucide:x" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit.prevent="onSubmit">

                <!-- Name -->
                <UFormField required label="Holiday Name" name="name">
                    <UInput v-model="state.name" placeholder="e.g. Independence Day" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Enter the official name of the holiday.
                        </p>
                    </template>
                </UFormField>

                <!-- Type -->
                <UFormField required label="Holiday Type" name="kind">
                    <USelect :items="kinds" @change="changeKind" v-model="state.kind"
                        placeholder="Select holiday type" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Choose whether this is a public holiday or a school-specific holiday.
                        </p>
                    </template>
                </UFormField>

                <!-- Date -->
                <UFormField required label="Holiday Date" name="date">
                    <UInput type="date" v-model="state.date" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">
                            Select the date this holiday occurs.
                        </p>
                    </template>
                </UFormField>

                <!-- Fixed / Recurring -->
                <UFormField name="fixed">
                    <div class="flex items-center justify-between p-4 rounded-xl border transition" :class="state.kind === 'PUBLIC'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 bg-gray-50'">
                        <div>
                            <p class="font-medium">
                                Recurring Every Academic Year
                            </p>

                            <p class="text-xs text-muted mt-1">
                                {{
                                    state.kind === 'PUBLIC'
                                        ? 'Public holidays automatically repeat every academic year.'
                                        : 'Enable this if the holiday happens every year on the same date.'
                                }}
                            </p>
                        </div>

                        <USwitch v-model="state.fixed" :disabled="isLoading || state.kind === 'PUBLIC'" />
                    </div>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <UButton icon="lucide:save" :loading="isLoading" label="Save" @click="formRef?.submit()" />
                <UButton label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
            </div>
        </template>

    </u-slideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const store = useHolidayStore()
const { error: toastError, success: toastSuccess } = useNotify()

const kinds = [
    { label: 'Public', value: 'PUBLIC' },
    { label: 'School', value: 'SCHOOL' }
]

function changeKind() {
    state.fixed = true;
}

const isLoading = ref(false)
const open = ref(false)
const formRef = ref<any>(null)

type HolidayForm = {
    name: string
    kind: string
    date: string
    fixed: boolean
}

const state = reactive<HolidayForm>({
    name: '',
    kind: '',
    date: '',
    fixed: false
})

const schema = yup.object({
    name: yup.string().required('Holiday name is required'),
    kind: yup.string().required('Holiday type is required'),
    date: yup.string().required('Holiday date is required')
})

const close = () => {
    open.value = false
    state.name = ''
    state.kind = ''
    state.date = ''
    state.fixed = false
}

const onSubmit = async (event: FormSubmitEvent<HolidayForm>) => {
    isLoading.value = true

    try {
        await schema.validate(state, { abortEarly: false })

        await store.create({
            name: state.name,
            kind: state.kind,
            date: state.date,
            fixed: state.fixed
        })

        await store.fetchAll()

        toastSuccess('Holiday created successfully')

        close()
    } catch (err: any) {
        toastError(err.message || 'Something went wrong')
    } finally {
        isLoading.value = false
    }
}
</script>