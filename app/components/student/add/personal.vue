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
            <div
                class="grid grid-cols-1 gap-4 border-b border-gray-200 p-4 dark:border-gray-800 md:grid-cols-2 md:gap-5 md:p-5">
                <UFormField name="givenNames" label="Given Names" required>
                    <UInput v-model="form.givenNames" placeholder="Enter given names" :leading-icon="USER_ICON" />
                    <template #help>
                        <p class="text-sm text-muted">
                            You can enter multiple given names separated by spaces.
                        </p>
                    </template>
                </UFormField>

                <UFormField name="familyName" label="Family Name" required>
                    <UInput v-model="form.familyName" placeholder="Enter family name" :leading-icon="USER_ICON" />
                    <template #help>
                        <p class="text-sm text-muted">
                            Enter the student's surname or last name.
                        </p>
                    </template>
                </UFormField>

                <UFormField name="dob" label="Date of Birth" required>
                    <UInput v-model="form.dob" type="date" :leading-icon="CALENDAR_ICON" />
                    <template #help>
                        <p class="text-sm text-muted">
                            Select the student's date of birth. Must be a past date.
                        </p>
                    </template>
                </UFormField>

                <UFormField name="gender" label="Gender" required>
                    <USelectMenu v-model="form.gender" :items="genders" value-key="value" placeholder="Select gender"
                        :leading-icon="GENDER_ICON" />
                    <template #help>
                        <p class="text-sm text-muted">
                            Select the student's gender.
                        </p>
                    </template>
                </UFormField>

                <UFormField name="nationality" label="Nationality" required>
                    <USelectMenu v-model="form.nationality" :items="nationalities" value-key="value"
                        placeholder="Select nationality" :leading-icon="FLAG_ICON" />
                    <template #help>
                        <p class="text-sm text-muted">
                            Select the student's nationality.
                        </p>
                    </template>
                </UFormField>

                <UFormField name="religion" label="Religion" required>
                    <USelectMenu v-model="form.religion" :items="religions" value-key="value"
                        placeholder="Select religion" :leading-icon="BOOK_ICON" />
                    <template #help>
                        <p class="text-sm text-muted">
                            Select the student's religion.
                        </p>
                    </template>
                </UFormField>

                <UFormField name="city" label="City" required>
                    <UInput v-model="form.city" placeholder="Enter city" :leading-icon="CITY_ICON" />
                    <template #help>
                        <p class="text-sm text-muted">
                            Enter the city or town where the student currently resides.
                        </p>
                    </template>
                </UFormField>

                <UFormField name="street" label="Address" required>
                    <UInput v-model="form.street" placeholder="Enter address" :leading-icon="ADDRESS_ICON" />
                    <template #help>
                        <p class="text-sm text-muted">
                            Enter the student's full residential address including street name and house number.
                        </p>
                    </template>
                
                </UFormField>
            </div>

            <div class="flex flex-col-reverse gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
                <p class="text-sm text-muted">Step 1 of 4</p>
                <UButton type="submit" class="w-full justify-center sm:w-auto" :trailing-icon="NEXT_ICON"
                    label="Next Step" />
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
