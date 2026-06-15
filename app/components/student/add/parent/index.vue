<template>
    <UCard :ui="{ body: 'sm:p-0' }">
        <template #header>
            <div>
                <p class="text-lg font-semibold md:text-xl">Parent / Guardian Information</p>
                <p class="text-sm text-muted">Provide parent or legal guardian contact details.</p>
            </div>
        </template>

        <UForm :state="form" :schema="schema" @submit="next">
            <div>

                <!-- Parent Information -->
                <div
                    class="grid grid-cols-1 gap-4 border-b border-gray-200 p-4 dark:border-gray-800 md:grid-cols-2 md:gap-5 md:p-5">

                    <UFormField name="fatherName" label="Father's Name" required>
                        <UInput v-model="form.fatherName" placeholder="Enter father's full name"
                            :leading-icon="USER_ICON" />

                        <template #help>
                           <p class="text-sm text-muted">
                                Enter the father's full legal name. 
                            </p>
                        </template>
                    </UFormField>

                    <UFormField name="motherName" label="Mother's Name" required>
                        <UInput v-model="form.motherName" placeholder="Enter mother's full name"
                            :leading-icon="USER_ICON" />
                        <template #help>
                            <p class="text-sm text-muted">
                                Enter the mother's full legal name.
                            </p>
                        </template>
                    </UFormField>

                    <UFormField name="fatherOccupation" label="Father's Occupation" required>
                        <UInput v-model="form.fatherOccupation" placeholder="e.g. Teacher, Engineer, Trader"
                            :leading-icon="BRIEFCASE_ICON" />
                        <template #help>
                            <p class="text-sm text-muted">
                                Enter the father's current occupation or write "Retired" / "Unemployed" if applicable.
                            </p>
                        </template>
                    </UFormField>

                    <UFormField name="motherOccupation" label="Mother's Occupation" required>
                        <UInput v-model="form.motherOccupation" placeholder="e.g. Nurse, Accountant, Trader"
                            :leading-icon="BRIEFCASE_ICON" />
                        <template #help>
                            Enter the mother's current occupation or write "Homemaker" / "Unemployed" if applicable.
                        </template>
                    </UFormField>

                    <UFormField name="fatherContact" label="Father's Contact" required>
                        <UInput v-model="form.fatherContact" placeholder="e.g. +23276000000"
                            :leading-icon="PHONE_ICON" />

                        <template #help>
                            Enter a valid phone number including the country code, e.g. +232 for Sierra Leone.
                        </template>
                    </UFormField>

                    <UFormField name="motherContact" label="Mother's Contact" required>
                        <UInput v-model="form.motherContact" placeholder="e.g. +23276000000"
                            :leading-icon="PHONE_ICON" />
                        <template #help>
                            Enter a valid phone number including the country code, e.g. +232 for Sierra Leone.
                        </template>
                    </UFormField>

                </div>

                <!-- Guardian Section -->
                <div class="space-y-5 p-4 md:p-5">

                    <div>
                        <p class="uppercase font-medium">Guardian Details</p>
                        <p class="text-sm text-muted mt-1">
                            Choose an existing guardian or create a new one.
                        </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-col gap-3 sm:flex-row">
                        <UButton @click="action = 0" :variant="action === 0 ? 'solid' : 'outline'"
                            label="Find existing guardian" class="w-full justify-center" size="xl" />
                        <UButton @click="action = 1" :variant="action === 1 ? 'solid' : 'outline'"
                            label="Add new guardian" class="w-full justify-center" size="xl" />
                    </div>

                    <!-- Existing Guardian -->
                    <div v-if="action === 0" class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">

                        <UFormField name="existingGuardianId" label="Select Guardian" required>
                            <USelectMenu :loading="loading" v-model="form.existingGuardianId" :items="existingGuardians"
                                value-key="value" option-attribute="label" placeholder="Select guardian"
                                :leading-icon="SEARCH_ICON" />
                            <template #help>
                                Search for a guardian already registered in the system by name or phone number.
                            </template>
                        </UFormField>

                        <UFormField name="relationship" label="Relationship" required>
                            <USelectMenu v-model="form.relationship" :items="relationships" value-key="value"
                                placeholder="Select relationship" :leading-icon="RELATIONSHIP_ICON" />
                            <template #help>
                                Select how this guardian is related to the student.
                            </template>
                        </UFormField>

                    </div>

                    <!-- New Guardian -->
                    <div v-if="action === 1" class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">

                        <UFormField name="guardianGivenNames" label="Guardian Given Names" required>
                            <UInput v-model="form.guardianGivenNames" placeholder="Enter given names"
                                :leading-icon="USER_ICON" />
                            <template #help>
                                Enter all first and middle names of the guardian.
                            </template>
                        </UFormField>

                        <UFormField name="guardianFamilyName" label="Guardian Family Name" required>
                            <UInput v-model="form.guardianFamilyName" placeholder="Enter family name"
                                :leading-icon="USER_ICON" />
                            <template #help>
                                Enter the guardian's surname or last name.
                            </template>
                        </UFormField>

                        <UFormField name="relationship" label="Relationship" required>
                            <USelectMenu v-model="form.relationship" :items="relationships" value-key="value"
                                placeholder="Select relationship" :leading-icon="RELATIONSHIP_ICON" />
                            <template #help>
                                Select how this guardian is related to the student.
                            </template>
                        </UFormField>

                        <UFormField name="guardianPhone" label="Phone Number" required>
                            <UInput v-model="form.guardianPhone" placeholder="e.g. +23276000000"
                                :leading-icon="PHONE_ICON" />
                            <template #help>
                                Enter a valid phone number including the country code, e.g. +232 for Sierra Leone.
                            </template>
                        </UFormField>

                        <UFormField name="guardianEmail" label="Email Address">
                            <UInput v-model="form.guardianEmail" placeholder="Enter email address"
                                :leading-icon="EMAIL_ICON" />
                            <template #help>
                                Optional. Used for school communications and portal access.
                            </template>
                        </UFormField>

                        <UFormField name="guardianCity" label="City" required>
                            <UInput v-model="form.guardianCity" placeholder="Enter city" :leading-icon="CITY_ICON" />
                            <template #help>
                                Enter the city or town where the guardian currently resides.
                            </template>
                        </UFormField>

                        <UFormField class="md:col-span-2" name="guardianAddress" label="Address" required>
                            <UTextarea v-model="form.guardianAddress" placeholder="Enter full address"
                                :leading-icon="ADDRESS_ICON" />
                            <template #help>
                             <p class="text-sm text-muted">
                                Enter the guardian's full residential address including street name and house number.
                             </p>
                            </template>
                        </UFormField>

                    </div>

                </div>

                <!-- Footer -->
                <div
                    class="flex flex-col-reverse gap-3 border-t border-gray-200 px-4 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between md:px-5">
                    <p class="text-sm text-muted">Step 2 of 4</p>
                    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <UButton @click="back" label="Back" :icon="BACK_ICON" variant="outline" color="neutral"
                            class="w-full justify-center sm:w-auto" />
                        <UButton type="submit" label="Next Step" :trailing-icon="NEXT_ICON"
                            class="w-full justify-center sm:w-auto" />
                    </div>
                </div>

            </div>
        </UForm>
    </UCard>
</template>

<script lang="ts" setup>
import * as yup from 'yup'

const phoneRegex = /^\+?[0-9\s\-().]{7,20}$/

const store = useParentStore()
const { records, loading } = storeToRefs(store)
const action = ref(1)

const { state } = defineProps<{
    state: any
}>()

const emit = defineEmits<{
    next: [typeof form]
    back: []
}>()

const form = reactive({
    fatherName: '',
    motherName: '',
    motherOccupation: '',
    fatherOccupation: '',
    fatherContact: '',
    motherContact: '',

    existingGuardianId: '',

    guardianGivenNames: '',
    guardianFamilyName: '',
    relationship: '',
    guardianPhone: '',
    guardianEmail: '',
    guardianCity: '',
    guardianAddress: ''
})

const schema = yup.object({
    fatherName: yup.string().required('Father name is required'),

    motherName: yup.string().required('Mother name is required'),

    fatherOccupation: yup.string().required('Father occupation is required'),

    motherOccupation: yup.string().required('Mother occupation is required'),

    fatherContact: yup
        .string()
        .required('Father contact is required')
        .matches(phoneRegex, 'Enter a valid phone number'),

    motherContact: yup
        .string()
        .required('Mother contact is required')
        .matches(phoneRegex, 'Enter a valid phone number'),

    relationship: yup.string().required('Relationship is required'),

    existingGuardianId: yup.string().when([], {
        is: () => action.value === 0,
        then: (s) => s.required('Please select a guardian'),
        otherwise: (s) => s.optional()
    }),

    guardianGivenNames: yup.string().when([], {
        is: () => action.value === 1,
        then: (s) => s.required('Guardian given names are required'),
        otherwise: (s) => s.optional()
    }),

    guardianFamilyName: yup.string().when([], {
        is: () => action.value === 1,
        then: (s) => s.required('Guardian family name is required'),
        otherwise: (s) => s.optional()
    }),

    guardianPhone: yup.string().when([], {
        is: () => action.value === 1,
        then: (s) =>
            s.required('Guardian phone number is required')
                .matches(phoneRegex, 'Enter a valid phone number'),
        otherwise: (s) => s.optional()
    }),

    // Email is optional but must be valid if provided
    guardianEmail: yup.string().when([], {
        is: () => action.value === 1,
        then: (s) => s.optional().email('Enter a valid email address'),
        otherwise: (s) => s.optional()
    }),

    guardianCity: yup.string().when([], {
        is: () => action.value === 1,
        then: (s) => s.required('Guardian city is required'),
        otherwise: (s) => s.optional()
    }),

    guardianAddress: yup.string().when([], {
        is: () => action.value === 1,
        then: (s) => s.required('Guardian address is required'),
        otherwise: (s) => s.optional()
    })
})

const relationships = [
    { label: 'Father', value: 'FATHER' },
    { label: 'Mother', value: 'MOTHER' },
    { label: 'Brother', value: 'BROTHER' },
    { label: 'Sister', value: 'SISTER' },
    { label: 'Guardian', value: 'GUARDIAN' },
    { label: 'Grandparent', value: 'GRANDPARENT' },
    { label: 'Other', value: 'OTHER' }
]

const existingGuardians = computed(() =>
    records.value.map(e => ({
        label: `${e.givenNames} ${e.familyName} - ${e.phone}`,
        value: e.id
    }))
)

function next() {
    emit('next', { ...form })
}

function back() {
    emit('back')
}

const NEXT_ICON = 'i-lucide-arrow-right'
const BACK_ICON = 'i-lucide-arrow-left'

watch(
    () => state,
    (newVal) => {
        if (!newVal) return
        Object.assign(form, { ...newVal })
    },
    { immediate: true }
)

onMounted(async () => {
    await store.fetchAll(0, 0)
})
</script>
