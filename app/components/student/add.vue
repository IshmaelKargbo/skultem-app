<template>
    <u-slideover title="Add Student" :open="open" @update:open="open = $event">
        <!-- Trigger button -->
        <UButton variant="subtle" color="primary" label="Add Student" icon="prime:plus" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Student</p>
                <u-button icon="codicon:close" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body / Form -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit.prevent="onSubmit">
                <UFormField required label="Given Names" name="givenNames">
                    <UInput v-model="state.givenNames" placeholder="e.g. Medisha, Rahim, Mohamed" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">Enter the given names of the student (e.g. Medisha, Rahim, Mohamed).
                        </p>
                    </template>
                </UFormField>
                <UFormField required label="Family Name" name="familyName">
                    <UInput v-model="state.familyName" placeholder="e.g. Kargbo, Turay, Samura" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">Enter the family name of the student (e.g. Kargbo, Turay, Samura).
                        </p>
                    </template>
                </UFormField>
                <UFormField required label="Date of Birth" name="dateOfBirth">
                    <UInput v-model="state.dateOfBirth" placeholder="e.g. 1990-01-01" type="date" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">Enter the date of birth of the student (e.g.
                            1990-01-01).
                        </p>
                    </template>
                </UFormField>
                <UFormField label="Gender" name="gender">
                    <USelect :items="genders" v-model="state.gender" :disabled="isLoading"
                        placeholder="Select gender" />
                    <template #help>
                        <p class="text-xs text-muted">Enter the gender of the student.</p>
                    </template>
                </UFormField>
                <UFormField required label="Academic Number" name="academicNumber">
                    <UInput v-model="state.academicNumber" placeholder="e.g. ST12345" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">Enter the academic number of the student (e.g. ST12345).</p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <u-button icon="mynaui:save" :loading="isLoading" label="Save" variant="subtle"
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

const store = useStudentStore()
const toast = useToast()
const isLoading = ref(false)

const genders = [
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' }
]

type StudentForm = {
    givenNames: string
    familyName: string
    academicNumber: string
    dateOfBirth: string
    gender: string
}

// reactive form state
const state = reactive<StudentForm>({
    givenNames: '',
    familyName: '',
    academicNumber: '',
    dateOfBirth: '',
    gender: ''
})

// yup validation schema
const schema = yup.object({
    givenNames: yup.string().required('Given names are required'),
    familyName: yup.string().required('Family name is required'),
    academicNumber: yup.string().required('Academic number is required'),
    dateOfBirth: yup.string().required('Date of birth is required'),
    gender: yup.string().required('Gender is required')
})

const formRef = ref<any>(null)
const open = ref(false)

const close = () => {
    open.value = false
    state.givenNames = ''
    state.familyName = ''
    state.academicNumber = ''
    state.dateOfBirth = ''
    state.gender = ''
}

const onSubmit = async (event: FormSubmitEvent<StudentForm>) => {
    event.preventDefault()
    isLoading.value = true

    try {
        await schema.validate(state, { abortEarly: false })
        await store.create({
            givenNames: state.givenNames,
            familyName: state.familyName,
            academicNumber: state.academicNumber,
            dateOfBirth: state.dateOfBirth,
            gender: state.gender,
        })

        await store.fetchAll()
        toast.add({ description: 'Student created successfully', color: 'success' })
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
