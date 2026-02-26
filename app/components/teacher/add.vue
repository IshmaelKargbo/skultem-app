<template>
    <u-slideover title="Add Teacher" :open="open" @update:open="open = $event">
        <!-- Trigger button -->
        <UButton color="primary" label="Add Teacher" icon="prime:plus" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex justify-between w-full items-center">
                <p class="text-lg font-semibold">Add Teacher</p>
                <u-button icon="codicon:close" variant="ghost" color="neutral" @click="close" />
            </div>
        </template>

        <!-- Body / Form -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4 w-full" @submit.prevent="onSubmit">
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
                <UFormField required label="Email" name="email">
                    <UInput v-model="state.email" placeholder="e.g. john.doe@example.com" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">Enter the email address of the teacher (e.g.
                            john.doe@example.com).
                        </p>
                    </template>
                </UFormField>
                <UFormField label="Phone" name="phone">
                    <UInput v-model="state.phone" required placeholder="e.g. +1234567890" :disabled="isLoading" />
                    <template #help>
                        <p class="text-xs text-muted">Enter the phone number of the teacher (e.g. +1234567890).</p>
                    </template>
                </UFormField>
                <UFormField label="Region" name="region">
                    <USelect :items="regions" required v-model="state.region" :disabled="isLoading"
                        placeholder="Select region" />
                    <template #help>
                        <p class="text-xs text-muted">Enter the region of the teacher address.</p>
                    </template>
                </UFormField>
                <UFormField label="District" required name="district">
                    <USelect :items="districts" v-model="state.district" :disabled="isLoading"
                        placeholder="Select district" />
                    <template #help>
                        <p class="text-xs text-muted">Enter the district of the teacher address.</p>
                    </template>
                </UFormField>
                <UFormField label="Chiefdom" required name="chiefdom">
                    <USelect :items="chiefdoms" v-model="state.chiefdom" :disabled="isLoading"
                        placeholder="Select chiefdom" />
                    <template #help>
                        <p class="text-xs text-muted">Enter the chiefdom of the teacher address.</p>
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
                    <template #hint>
                        <p class="text-xs text-muted">Enter the street address of the teacher.</p>
                    </template>
                </UFormField>
                <UFormField required label="Staff ID" name="staffId">
                    <UInput v-model="state.staffId" placeholder="e.g. ST12345" :disabled="isLoading" />
                    <template #hint>
                        <p class="text-xs text-muted">Enter the staff ID of the teacher (e.g. ST12345).</p>
                    </template>
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex space-x-3">
                <u-button icon="mynaui:save" :loading="isLoading" label="Save" @click="formRef?.submit()" />
                <u-button label="Cancel" variant="outline" color="neutral" @click="close" :disabled="isLoading" />
            </div>
        </template>
    </u-slideover>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import { reactive, ref } from 'vue'
import rdcsl from "rdcsl"
import type { FormSubmitEvent } from '#ui/types'

const store = useTeacherStore()
const toast = useToast()
const isLoading = ref(false)

const regions = computed(() => rdcsl.regions.map(r => ({ label: r, value: r })))

const districts = computed(() => {
    state.district = '' // reset district when region changes
    state.chiefdom = '' // reset chiefdom when region changes
    return rdcsl.regionDistricts(state.region)?.map((r: string) => ({ label: r, value: r })) || []
})

const chiefdoms = computed(() => {
    state.chiefdom = '' // reset chiefdom when district changes
    return rdcsl.districtChiefdoms(state.district)?.map((r: string) => ({ label: r, value: r })) || []
})

type TeacherForm = {
    givenNames: string
    familyName: string
    staffId: string
    email: string
    phone: string
    region: string
    district: string
    chiefdom: string
    city: string
    street: string
}

// reactive form state
const state = reactive<TeacherForm>({
    givenNames: '',
    familyName: '',
    staffId: '',
    email: '',
    phone: '',
    region: '',
    district: '',
    chiefdom: '',
    city: '',
    street: ''
})

// yup validation schema
const schema = yup.object({
    givenNames: yup.string().required('Given names are required'),
    familyName: yup.string().required('Family name is required'),
    staffId: yup.string().required('Staff ID is required'),
    phone: yup.string().required('Phone number is required').matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    region: yup.string().required('Region is required'),
    district: yup.string().required('District is required'),
    chiefdom: yup.string().required('Chiefdom is required'),
    city: yup.string().required('City is required'),
    street: yup.string().required('Street is required')
})

const formRef = ref<any>(null)
const open = ref(false)

const close = () => {
    open.value = false
    state.givenNames = ''
    state.familyName = ''
    state.staffId = ''
    state.email = ''
    state.phone = ''
    state.region = ''
    state.district = ''
    state.chiefdom = ''
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
            region: state.region,
            district: state.district,
            chiefdom: state.chiefdom,
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

onMounted(() => {
    store.fetchAll()
})
</script>
