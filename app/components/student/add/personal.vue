<template>
    <UCard :ui="{ body: 'sm:p-0' }">
        <template #header>
            <div>
                <p class="text-lg font-semibold md:text-xl">Personal Information</p>
                <p class="text-sm text-muted">
                    Enter the student's basic details and upload a photo.
                </p>
            </div>
        </template>

        <UForm :state="form" :schema="schema" @submit="next">
            <div class="grid grid-cols-1 gap-4 border-b border-gray-200 p-4 dark:border-gray-800 md:grid-cols-2 md:gap-5 md:p-5">
                <UFormField name="givenNames" label="Given Names" required>
                    <UInput placeholder="Enter given names" v-model="form.givenNames" />
                    <template #help>
                        Enter all first and middle names exactly as they appear on official documents.
                    </template>
                </UFormField>

                <UFormField name="familyName" label="Family Name" required>
                    <UInput placeholder="Enter family name" v-model="form.familyName" />
                    <template #help>
                        Enter the surname or last name as it appears on official documents.
                    </template>
                </UFormField>

                <UFormField name="dob" label="Date of Birth" required>
                    <UInput placeholder="Select date of birth" v-model="form.dob" type="date" />
                    <template #help>
                        The student's date of birth is used to verify age and determine grade eligibility.
                    </template>
                </UFormField>

                <UFormField name="gender" label="Gender" required>
                    <USelectMenu placeholder="Select Gender" value-key="value" v-model="form.gender" :items="genders" />
                    <template #help>
                        Select the gender recorded on the student's official identification.
                    </template>
                </UFormField>

                <UFormField name="nationality" label="Nationality" required>
                    <USelectMenu placeholder="Select nationality" value-key="value" v-model="form.nationality"
                        :items="nationalities" />
                    <template #help>
                        Select the country of which the student is a citizen. This may differ from their country of
                        residence.
                    </template>
                </UFormField>

                <UFormField name="religion" label="Religion" required>
                    <USelectMenu placeholder="Select Religion" value-key="value" v-model="form.religion"
                        :items="religions" />
                    <template #help>
                        This information may be used to accommodate religious observances and dietary requirements.
                    </template>
                </UFormField>

                <UFormField name="city" label="City" required>
                    <UInput placeholder="Enter city" v-model="form.city" />
                    <template #help>
                        Enter the city or town where the student currently resides.
                    </template>
                </UFormField>

                <UFormField name="street" label="Address" required>
                    <UInput placeholder="Enter address" v-model="form.street" />
                    <template #help>
                        Enter the student's current home address including street name and number.
                    </template>
                </UFormField>
            </div>

            <div class="flex flex-col-reverse gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
                <p class="text-sm text-muted">Step 1 of 4</p>
                <UButton type="submit" class="w-full justify-center sm:w-auto" :trailing-icon="NEXT_ICON" label="Next Step" />
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
    dob: yup.string().required('Date of birth is required')
        .test('is-past', 'Date of birth must be in the past', value => {
            if (!value) return false
            const dob = new Date(value)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            return dob < today
        }),
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
    emit('next', { ...form })
}

watch(() => state, (newVal) => {
    if (!newVal) return
    const dob = newVal.dob ? new Date(newVal.dob).toISOString().split('T')[0] : ''
    Object.assign(form, { ...newVal, dob })
}, { immediate: true })
</script>
