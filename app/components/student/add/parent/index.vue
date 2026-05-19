<template>
    <UCard :ui="{ body: 'sm:p-0' }">
        <template #header>
            <div>
                <p class="text-xl font-semibold">
                    Parent / Guardian Information
                </p>

                <p class="text-sm text-muted">
                    Provide parent or legal guardian contact details.
                </p>
            </div>
        </template>

        <UForm :state="form" :schema="schema" @submit="next">
            <div>

                <!-- Parent Information -->
                <div class="p-5 border-b dark:border-gray-800 border-gray-200 grid grid-cols-2 gap-4">

                    <UFormField name="fatherName" label="Father Name" required>
                        <UInput placeholder="Enter father's name" v-model="form.fatherName" />
                    </UFormField>

                    <UFormField name="motherName" label="Mother Name" required>
                        <UInput placeholder="Enter mother's name" v-model="form.motherName" />
                    </UFormField>

                    <UFormField name="fatherOccupation" label="Father's Occupation" required>
                        <UInput placeholder="Enter father's occupation" v-model="form.fatherOccupation" />
                    </UFormField>

                    <UFormField name="motherOccupation" label="Mother's Occupation" required>
                        <UInput placeholder="Enter mother's occupation" v-model="form.motherOccupation" />
                    </UFormField>

                    <UFormField name="fatherContact" label="Father's Contact" required>
                        <UInput placeholder="Enter father's contact" v-model="form.fatherContact" />
                    </UFormField>

                    <UFormField name="motherContact" label="Mother's Contact" required>
                        <UInput placeholder="Enter mother's contact" v-model="form.motherContact" />
                    </UFormField>

                </div>

                <!-- Guardian Section -->
                <div class="p-5 space-y-5">

                    <div>
                        <p class="uppercase font-medium">
                            Guardian Details
                        </p>

                        <p class="text-sm text-muted mt-1">
                            Choose an existing guardian or create a new one.
                        </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex items-center space-x-3">
                        <UButton @click="action = 0" :variant="action === 0 ? 'solid' : 'outline'"
                            label="Find existing guardian" class="w-full flex items-center justify-center" size="xl" />

                        <UButton @click="action = 1" :variant="action === 1 ? 'solid' : 'outline'"
                            label="Add new guardian" class="w-full flex items-center justify-center" size="xl" />
                    </div>

                    <!-- Existing Guardian -->
                    <div v-if="action === 0" class="grid grid-cols-2 gap-4">

                        <UFormField name="existingGuardianId" label="Select Guardian" required>
                            <USelectMenu :loading="loading" v-model="form.existingGuardianId" value-key="value"
                                option-attribute="label" placeholder="Select guardian" :items="existingGuardians" />
                        </UFormField>

                        <UFormField name="relationship" label="Relationship" required>
                            <USelectMenu placeholder="Select relationship" value-key="value" v-model="form.relationship"
                                :items="relationships" />
                        </UFormField>

                    </div>

                    <!-- New Guardian -->
                    <div v-if="action === 1" class="grid grid-cols-2 gap-4">

                        <UFormField name="guardianGivenNames" label="Guardian Given Names" required>
                            <UInput placeholder="Enter guardian's given names" v-model="form.guardianGivenNames" />
                        </UFormField>

                        <UFormField name="guardianFamilyName" label="Guardian Family Name" required>
                            <UInput placeholder="Enter guardian's family name" v-model="form.guardianFamilyName" />
                        </UFormField>

                        <UFormField name="relationship" label="Relationship" required>
                            <USelectMenu placeholder="Select relationship" value-key="value" v-model="form.relationship"
                                :items="relationships" />
                        </UFormField>

                        <UFormField name="guardianPhone" label="Phone Number" required>
                            <UInput placeholder="Enter phone number" v-model="form.guardianPhone" />
                        </UFormField>

                        <UFormField name="guardianEmail" label="Email Address" required>
                            <UInput placeholder="Enter email address" v-model="form.guardianEmail" />
                        </UFormField>
                        <UFormField name="guardianCity" label="City" required>
                            <UInput placeholder="Enter city" v-model="form.guardianCity" />
                        </UFormField>

                        <UFormField class="col-span-2" name="guardianAddress" label="Address" required>
                            <UTextarea placeholder="Enter address" v-model="form.guardianAddress" />
                        </UFormField>

                    </div>

                </div>

                <!-- Footer -->
                <div class="flex px-5 py-4 justify-between items-center border-t dark:border-gray-800 border-gray-200">

                    <p class="text-sm text-muted">
                        Step 2 of 4
                    </p>

                    <div class="space-x-2 flex items-center">
                        <UButton @click="back" label="Back" :icon="BACK_ICON" variant="outline" color="neutral" />

                        <UButton type="submit" label="Next Step" :trailing-icon="NEXT_ICON" />
                    </div>

                </div>

            </div>
        </UForm>
    </UCard>
</template>

<script lang="ts" setup>
import * as yup from 'yup'

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

    fatherName: yup
        .string()
        .required('Father name is required'),

    motherName: yup
        .string()
        .required('Mother name is required'),

    fatherOccupation: yup
        .string()
        .required("Father occupation is required"),

    motherOccupation: yup
        .string()
        .required("Mother occupation is required"),

    fatherContact: yup
        .string()
        .required("Father contact is required"),

    motherContact: yup
        .string()
        .required("Mother contact is required"),

    relationship: yup
        .string()
        .required('Relationship is required'),

    existingGuardianId: yup.string().when([], {
        is: () => action.value === 0,
        then: (schema) =>
            schema.required('Please select a guardian'),
        otherwise: (schema) => schema.optional()
    }),

    guardianGivenNames: yup.string().when([], {
        is: () => action.value === 1,
        then: (schema) =>
            schema.required('Guardian given names are required'),
        otherwise: (schema) => schema.optional()
    }),

    guardianFamilyName: yup.string().when([], {
        is: () => action.value === 1,
        then: (schema) =>
            schema.required('Guardian family name is required'),
        otherwise: (schema) => schema.optional()
    }),

    guardianPhone: yup.string().when([], {
        is: () => action.value === 1,
        then: (schema) =>
            schema.required('Guardian phone number is required'),
        otherwise: (schema) => schema.optional()
    }),

    guardianEmail: yup.string().when([], {
        is: () => action.value === 1,
        then: (schema) =>
            schema
                .email('Invalid email address')
                .required('Guardian email is required'),
        otherwise: (schema) => schema.optional()
    }),

    guardianCity: yup.string().when([], {
        is: () => action.value === 1,
        then: (schema) =>
            schema.required('Guardian city is required'),
        otherwise: (schema) => schema.optional()
    }),

    guardianAddress: yup.string().when([], {
        is: () => action.value === 1,
        then: (schema) =>
            schema.required('Guardian address is required'),
        otherwise: (schema) => schema.optional()
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

const existingGuardians = computed(() => records.value.map(e => ({ label: `${e.givenNames} ${e.familyName} - ${e.phone}`, value: e.id })))

function next() {
    emit('next', {
        ...form
    })
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

        Object.assign(form, {
            ...newVal
        })
    },
    {
        immediate: true
    }
)

onMounted(async () => {
    await store.fetchAll(0, 0)
})
</script>