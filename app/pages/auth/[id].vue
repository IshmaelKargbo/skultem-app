<template>
    <div class="space-y-4 px-4 md:px-6">
        <!-- Profile banner -->
        <UCard :ui="{ body: 'p-0 sm:p-0' }" class="overflow-hidden">
            <div
                class="h-20 bg-linear-to-br from-primary/15 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 md:h-24" />

            <div class="px-5 pb-5">
                <div class="-mt-12 flex flex-col gap-5 md:-mt-14 md:flex-row md:items-end md:justify-between">
                    <div class="flex min-w-0 items-end gap-4">
                        <!-- Avatar -->
                        <div
                            class="relative shrink-0 rounded-2xl bg-default p-1.5 shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                            <USkeleton v-if="loading" class="h-20 w-20 rounded-xl md:h-24 md:w-24" />

                            <template v-else>
                                <UAvatar :src="record?.photo || undefined" :alt="name" size="3xl"
                                    class="h-20 w-20 rounded-xl md:h-24 md:w-24" :class="{ 'opacity-50': uploadingPhoto }" />

                                <div v-if="uploadingPhoto" class="absolute inset-1.5 flex items-center justify-center rounded-xl">
                                    <UIcon name="i-lucide-loader-circle" class="animate-spin text-lg text-primary" />
                                </div>

                                <UTooltip v-else :delay-duration="0" arrow text="Upload photo">
                                    <label
                                        class="absolute -bottom-1 -right-1 flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-default bg-primary text-white shadow-md hover:bg-primary-600">
                                        <UIcon name="i-lucide-camera" class="size-3.5" />
                                        <input class="hidden" type="file" accept="image/png,image/jpeg,image/jpg"
                                            @change="onPhotoChange">
                                    </label>
                                </UTooltip>
                            </template>
                        </div>

                        <!-- Identity -->
                        <div class="min-w-0 pb-0.5 md:pb-1">
                            <USkeleton v-if="loading" class="h-6 w-48 md:h-7 md:w-60" />

                            <h2 v-else class="max-w-[calc(100vw-150px)] truncate text-xl font-bold tracking-tight text-highlighted md:max-w-md md:text-2xl">
                                {{ name }}
                            </h2>

                            <div v-if="loading" class="mt-2 flex items-center gap-2">
                                <USkeleton class="h-4 w-28" />
                            </div>

                            <div v-else class="mt-2 flex flex-wrap items-center gap-2">
                                <UBadge v-for="role in record?.roles" :key="role" :label="parseRole[role] || role"
                                    :color="parseRoleColor[role]" variant="subtle" size="xs" class="rounded-full" />
                            </div>

                            <div v-if="!loading" class="mt-1.5 flex items-center gap-1.5 text-xs text-dimmed">
                                <UIcon name="i-lucide-mail" class="size-3.5" />
                                <span class="font-medium text-muted">{{ record?.email || 'No email' }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex shrink-0 items-center gap-2">
                        <UButton to="/auth" variant="outline" size="sm" color="neutral" icon="i-lucide-arrow-left"
                            label="Users" />
                    </div>
                </div>
            </div>
        </UCard>

        <!-- Payroll -->
        <UCard>
            <template #header>
                <div>
                    <h3 class="font-semibold text-lg">Payroll</h3>
                    <p class="text-sm text-muted">
                        An account role alone doesn't put someone on payroll - this is separate.
                    </p>
                </div>
            </template>

            <div v-if="loadingPayroll" class="space-y-3">
                <USkeleton class="h-5 w-40" />
                <USkeleton class="h-4 w-64" />
            </div>

            <!-- Already on payroll -->
            <div v-else-if="payroll?.onPayroll" class="flex flex-wrap items-center gap-3 rounded-xl border border-success-200 bg-success-50 p-4 dark:border-success-800 dark:bg-success-950">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success-100 text-success-700 dark:bg-success-900 dark:text-success-300">
                    <UIcon name="i-lucide-badge-check" class="size-5" />
                </div>

                <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-highlighted">On payroll</p>
                    <p class="text-xs text-muted">
                        Staff ID {{ payroll.staffId }}<template v-if="payroll.designation"> &middot; {{ payroll.designation }}</template>
                    </p>
                </div>

                <UButton v-if="payroll.teacherId" :to="`/teachers/${payroll.teacherId}`" size="sm" variant="outline"
                    color="neutral" label="View Staff Record" trailing-icon="i-lucide-arrow-right" />
            </div>

            <!-- Not on payroll yet -->
            <template v-else>
                <UAlert color="warning" variant="soft" icon="i-lucide-alert-triangle" class="mb-4"
                    title="Not on payroll"
                    description="This account isn't included in payroll yet. Fill in the details below to add it." />

                <UForm :state="payrollForm" :schema="payrollSchema" class="space-y-4" @submit.prevent="onIncludeInPayroll">
                    <div class="grid gap-4 md:grid-cols-2">
                        <UFormField label="Staff ID" name="staffId" required>
                            <UInput v-model="payrollForm.staffId" placeholder="STAFF001" leading-icon="i-lucide-id-card" class="w-full" />
                        </UFormField>

                        <UFormField label="Designation" name="designation">
                            <UInput v-model="payrollForm.designation" placeholder="e.g. Accountant, Bursar"
                                leading-icon="i-lucide-briefcase" class="w-full" />
                        </UFormField>

                        <UFormField label="Title" name="title" required>
                            <USelectMenu v-model="payrollForm.title" :items="titles" value-key="value"
                                placeholder="Select title" class="w-full" />
                        </UFormField>

                        <UFormField label="Gender" name="gender" required>
                            <URadioGroup v-model="payrollForm.gender" variant="card" :items="genders" :ui="{ fieldset: 'grid grid-cols-2 gap-3' }" />
                        </UFormField>

                        <UFormField label="Phone Number" name="phone" required>
                            <UInput v-model="payrollForm.phone" placeholder="+1234567890" leading-icon="i-lucide-phone" class="w-full" />
                        </UFormField>

                        <UFormField label="City" name="city" required>
                            <UInput v-model="payrollForm.city" placeholder="Freetown" leading-icon="i-lucide-map-pin" class="w-full" />
                        </UFormField>

                        <UFormField label="Street Address" name="street" required class="md:col-span-2">
                            <UInput v-model="payrollForm.street" placeholder="123 Main Street" leading-icon="i-lucide-map" class="w-full" />
                        </UFormField>
                    </div>

                    <div class="flex justify-end">
                        <UButton type="submit" icon="i-lucide-badge-check" :loading="includingInPayroll"
                            label="Include in Payroll" />
                    </div>
                </UForm>
            </template>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})

const route = useRoute()
const store = useUserStore()
const notify = useNotify()

const record = ref<User | undefined>()
const loading = ref(true)

const payroll = ref<UserPayrollStatus | undefined>()
const loadingPayroll = ref(true)
const includingInPayroll = ref(false)
const uploadingPhoto = ref(false)

const name = computed(() => {
    if (!record.value) return ''
    return `${record.value.givenNames} ${record.value.familyName}`.trim()
})

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

const payrollForm = reactive({
    staffId: '',
    designation: '',
    title: '',
    gender: '',
    phone: '',
    city: '',
    street: ''
})

const payrollSchema = yup.object({
    staffId: yup.string().required('Staff ID is required'),
    title: yup.string().required('Title is required'),
    gender: yup.string().required('Gender is required'),
    phone: yup.string().required('Phone number is required').matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
    city: yup.string().required('City is required'),
    street: yup.string().required('Street address is required')
})

async function fetchUser() {
    loading.value = true
    try {
        record.value = await store.findOne(route.params.id as string)
    } finally {
        loading.value = false
    }
}

async function fetchPayrollStatus() {
    loadingPayroll.value = true
    try {
        payroll.value = await store.payrollStatus(route.params.id as string)
    } finally {
        loadingPayroll.value = false
    }
}

async function onIncludeInPayroll() {
    includingInPayroll.value = true
    try {
        payroll.value = await store.includeInPayroll(route.params.id as string, { ...payrollForm })
        notify.success('User included in payroll')
    } catch (err: any) {
        notify.error(err?.message || 'Unable to include this user in payroll.')
    } finally {
        includingInPayroll.value = false
    }
}

async function onPhotoChange(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''

    if (!file || !record.value) return

    if (file.size > 2 * 1024 * 1024) {
        notify.error('Photo must be 2MB or less')
        return
    }

    uploadingPhoto.value = true

    try {
        const res = await store.updatePhoto(record.value.id, file)
        if (res) record.value = res
        notify.success('Photo updated')
    } catch (err: any) {
        notify.error(err?.message || 'Failed to upload photo')
    } finally {
        uploadingPhoto.value = false
    }
}

onMounted(() => {
    useAppStore().setTitle('User Profile')
    document.title = 'User Profile | Auth | Skultem'

    fetchUser()
    fetchPayrollStatus()
})
</script>
