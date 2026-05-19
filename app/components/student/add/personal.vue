<template>
    <UCard :ui="{ body: 'sm:p-0' }">
        <template #header>
            <div>
                <p class="text-xl font-semibold">
                    Personal Information
                </p>
                <p class="text-sm text-muted">
                    Enter the student's basic details and upload a photo.
                </p>
            </div>
        </template>

        <UForm :state="form" :schema="schema" @submit="next">
            <div class="p-5 border-b dark:border-gray-800 border-gray-200 grid grid-cols-2 gap-4">
                <UFormField name="givenNames" label="Given Names" required>
                    <UInput placeholder="Enter given names" v-model="form.givenNames" />
                </UFormField>

                <UFormField name="familyName" label="Family Name" required>
                    <UInput placeholder="Enter family name" v-model="form.familyName" />
                </UFormField>

                <UFormField name="dob" label="Date of birth" required>
                    <UInput placeholder="Select date of birth" v-model="form.dob" type="date" />
                </UFormField>

                <UFormField name="gender" label="Gender" required>
                    <USelectMenu placeholder="Select Gender" value-key="value" v-model="form.gender" :items="genders" />
                </UFormField>

                <UFormField name="nationality" label="Nationality" required>
                    <USelectMenu placeholder="Enter nationality" value-key="value" v-model="form.nationality"
                        :items="nationalities" />
                </UFormField>

                <UFormField name="religion" label="Religion" required>
                    <USelectMenu placeholder="Select Religion" value-key="value" v-model="form.religion"
                        :items="religions" />
                </UFormField>

                <UFormField name="city" label="City" required>
                    <UInput placeholder="Enter city" v-model="form.city" />
                </UFormField>

                <UFormField name="street" label="Address" required>
                    <UInput placeholder="Enter address" v-model="form.street" />
                </UFormField>
            </div>

            <div class="flex px-5 py-4 justify-between items-center">
                <p class="text-sm text-muted">
                    Step 1 of 4
                </p>
                <UButton type="submit" :trailing-icon="NEXT_ICON" label="Next Step" />
            </div>
        </UForm>
    </UCard>
</template>

<script lang="ts" setup>
import * as yup from 'yup'

const { state } = defineProps<{
    state: {
        givenNames: string
        familyName: string
        dob: string
        gender: string
        nationality: string
        religion: string
        city: string
        street: string
    }
}>()

const emit = defineEmits<{
    next: [typeof form]
}>()

const schema = yup.object({
    givenNames: yup.string().required('Given names are required'),
    familyName: yup.string().required('Family name is required'),
    dob: yup.string().required('Date of birth is required'),
    gender: yup.string().required('Gender is required'),
    religion: yup.string().required('Religion is required'),
    nationality: yup.string().required('Nationality is required'),
    city: yup.string().required('City is required'),
    street: yup.string().required('Address is required')
})

const form = reactive({
    givenNames: '',
    familyName: '',
    dob: '',
    gender: '',
    nationality: '',
    religion: '',
    city: '',
    street: ''
})

const genders = [
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' }
]

const religions = [
    { label: 'Christianity', value: 'CHRISTIANITY' },
    { label: 'Islam', value: 'ISLAM' },
    { label: 'Other', value: 'OTHER' }
]

function next() {
    emit('next', {
        ...form
    })
}

watch(() => state, (newVal) => {
    if (!newVal) return

    const dob = newVal.dob ? new Date(newVal.dob).toISOString().split('T')[0] : ''
    Object.assign(form, { ...newVal, dob })
}, {
    immediate: true
})
</script>