<template>
    <u-slideover :dismissible="false" title="Add Teacher" :open="open" @update:open="open = $event">
        <!-- Trigger button -->
        <UButton color="primary" label="Add Teacher" icon="prime:plus" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Teacher</p>
                <u-button icon="lucide:x" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body / Form -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit.prevent="onSubmit">
                <UFormField required label="Title" name="title">
                    <USelectMenu value-key="value" v-model="state.title" :items="titles" placeholder="Select title"
                        :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">Select the teacher title.</p>
                    </template>
                </UFormField>
                <UFormField required label="Given Names" name="givenNames">
                    <UInput v-model="state.givenNames" placeholder="e.g. Ishmael, Aruna, Rahim" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">Enter the given names of the teacher (e.g. Ishmael, Aruna, Rahim).
                        </p>
                    </template>
                </UFormField>
                <UFormField required label="Family Name" name="familyName">
                    <UInput v-model="state.familyName" placeholder="e.g. Kargbo, Kamara, Johnson"
                        :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">Enter the family name of the teacher (e.g. Kargbo, Kamara,
                            Johnson).
                        </p>
                    </template>
                </UFormField>
                <UFormField required label="Gender" name="gender">
                    <URadioGroup v-model="state.gender" variant="card" :items="genders" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">Select the teacher gender.</p>
                    </template>
                </UFormField>
                <UFormField required label="Email" name="email">
                    <UInput v-model="state.email" placeholder="e.g. ishmael.kargbo@example.com" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">Enter the email address of the teacher (e.g.
                            ishmael.kargbo@example.com).
                        </p>
                    </template>
                </UFormField>
                <UFormField label="Phone" name="phone">
                    <UInput v-model="state.phone" required placeholder="e.g. +1234567890" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">Enter the phone number of the teacher (e.g. +1234567890).</p>
                    </template>
                </UFormField>
                <UFormField label="City" required name="city">
                    <UInput v-model="state.city" placeholder="Select city" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">Enter the city of the teacher address.</p>
                    </template>
                </UFormField>
                <UFormField label="Street" required name="street">
                    <UInput v-model="state.street" placeholder="Enter street address" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">Enter the street address of the teacher.</p>
                    </template>
                </UFormField>
                <UFormField required label="Staff ID" name="staffId">
                    <UInput v-model="state.staffId" placeholder="e.g. ST12345" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">Enter the staff ID of the teacher (e.g. ST12345). Password is
                            generated automatically.</p>
                    </template>
                </UFormField>
                <UFormField label="Class Master" name="class">
                    <USelectMenu value-key="value" :items="classes" v-model="state.classMaster"
                        placeholder="Select class master" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">Assign this teacher as a class master</p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <u-button icon="lucide:save" :loading="isLoading" label="Save" @click="formRef?.submit()" />
                <u-button label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
            </div>
        </template>
    </u-slideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref } from 'vue'
import type { FormSubmitEvent } from '#ui/types'

const store = useTeacherStore()
const classStore = useClassSessionStore()
const toast = useToast()
const isLoading = ref(false)

type TeacherForm = {
    givenNames: string
    familyName: string
    staffId: string
    email: string
    phone: string
    city: string
    gender: string
    title: string
    classMaster: string
    street: string
}

const titles = [
    { label: 'Mr', value: 'MR' },
    { label: 'Mrs', value: 'MRS' },
    { label: 'Miss', value: 'MISS' },
    { label: 'Ms', value: 'MS' },
    { label: 'Dr', value: 'DR' },
    { label: 'Prof', value: 'PROF' }
]

const genders = [
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' }
]

const state = reactive<TeacherForm>({
    givenNames: '',
    familyName: '',
    staffId: '',
    email: '',
    phone: '',
    gender: '',
    title: '',
    classMaster: '',
    city: '',
    street: ''
})

const schema = yup.object({
    title: yup.string().required('Title is required'),
    givenNames: yup.string().required('Given names are required'),
    familyName: yup.string().required('Family name is required'),
    staffId: yup.string().required('Staff ID is required'),
    gender: yup.string().required('Gender is required'),
    phone: yup.string().required('Phone number is required').matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    city: yup.string().required('City is required'),
    street: yup.string().required('Street is required')
})

const classes = ref<{ label: string; value: string }[]>([])

const formRef = ref<any>(null)
const open = ref(false)

const close = () => {
    open.value = false
    state.givenNames = ''
    state.familyName = ''
    state.staffId = ''
    state.email = ''
    state.phone = ''
    state.title = ''
    state.gender = ''
    state.classMaster = ''
    state.city = ''
    state.street = ''
}

const onSubmit = async (event: FormSubmitEvent<TeacherForm>) => {
    event.preventDefault()
    isLoading.value = true

    try {
        await schema.validate(state, { abortEarly: false })
        await store.create({
            givenNames: state.givenNames,
            familyName: state.familyName,
            email: state.email,
            phone: state.phone,
            gender: state.gender,
            title: state.title,
            classMaster: state.classMaster,
            city: state.city,
            street: state.street,
            staffId: state.staffId
        })

        await store.fetchAll()
        toast.add({ description: 'Teacher created successfully', color: 'success' })
        close()
    } catch (err: any) {
        toast.add({ description: err.message, color: 'error' })
    } finally {
        isLoading.value = false
    }
}

watch(open, async (val) => {
    if (val) {
        const res = await classStore.fetchAllUnassign(0, 0)
        if (res == null) return
        classes.value = res.map((c: ClassSession) => ({
            label: c.clazz,
            value: c.id
        }))
    }
})
</script>
