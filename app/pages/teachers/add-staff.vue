<template>
  <div class="space-y-3 px-4 md:px-6">
    <UAlert color="primary" variant="soft" icon="i-lucide-info" title="They won't be sent login credentials"
      description="A record is still created for them under the hood - that's what payroll and attendance run off - but they're never emailed a password. If this person will log in themselves, use Add Teacher instead." />

    <!-- Stepper -->
    <nav ref="stepperEl" aria-label="Staff progress"
      class="scroll-mt-4 rounded-2xl border border-default bg-default p-3 sm:p-4 md:py-6">
      <ol class="flex items-start">
        <li v-for="(value, i) in steps" :key="value.title" class="relative flex flex-1 flex-col items-center">
          <div v-if="i < steps.length - 1" aria-hidden="true"
            class="absolute left-[calc(50%+1.25rem)] right-[calc(-50%+1.25rem)] top-4 h-0.5 overflow-hidden rounded-full bg-accented sm:top-5">
            <div class="h-full bg-primary transition-all duration-500" :class="step > i ? 'w-full' : 'w-0'" />
          </div>

          <button type="button" :disabled="i >= step" :aria-current="step === i ? 'step' : undefined"
            class="group flex flex-col items-center gap-2 disabled:cursor-default" @click="goTo(i)">
            <span
              class="relative z-1 flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 sm:size-10"
              :class="step > i
                ? 'bg-primary text-inverted group-hover:ring-4 group-hover:ring-primary/20'
                : step === i
                  ? 'bg-primary text-inverted ring-4 ring-primary/20'
                  : 'bg-elevated text-muted ring-1 ring-default'">
              <UIcon v-if="step > i" name="i-lucide-check" class="size-4 sm:size-5" />
              <UIcon v-else :name="value.icon" class="size-4 sm:size-5" />
            </span>
            <span class="hidden text-center sm:block">
              <span class="block text-sm font-medium transition-colors"
                :class="step >= i ? 'text-highlighted' : 'text-muted'">{{ value.title }}</span>
              <span class="hidden text-xs text-muted lg:block">{{ value.sub }}</span>
            </span>
          </button>
        </li>
      </ol>

      <!-- Mobile: name the current step under the dots -->
      <div class="mt-3 flex items-center justify-between gap-2 border-t border-default pt-3 sm:hidden">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-highlighted">{{ steps[step]?.title }}</p>
          <p class="truncate text-xs text-muted">{{ steps[step]?.sub }}</p>
        </div>
        <UBadge variant="subtle" color="primary" size="sm" class="shrink-0"
          :label="`${step + 1} / ${steps.length}`" />
      </div>
    </nav>

    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <template #header>
        <div>
          <p class="font-semibold md:text-xl">{{ steps[step]?.heading }}</p>
          <p class="text-sm text-muted">{{ steps[step]?.description }}</p>
        </div>
      </template>

      <UForm :key="step" ref="formRef" :state="state" :schema="currentSchema" @submit="onSubmit">
        <div class="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:gap-5 md:p-5">

          <!-- Per-step guidance -->
          <UAlert class="md:col-span-2" color="primary" variant="soft" icon="i-lucide-lightbulb"
            :title="steps[step]?.tipTitle" :description="steps[step]?.tip" />

          <!-- Step 1: Personal -->
          <template v-if="step === 0">
            <UFormField label="Title" name="title" required help="Shown before their name, e.g. Mr, Mrs, Dr.">
              <USelectMenu v-model="state.title" value-key="value" placeholder="Select title" :items="titles"
                leading-icon="i-lucide-graduation-cap" class="w-full" />
            </UFormField>

            <UFormField label="Gender" name="gender" required help="Used on records and reports.">
              <URadioGroup v-model="state.gender" variant="card" :items="genders"
                :ui="{ fieldset: 'grid grid-cols-2 gap-3' }" />
            </UFormField>

            <UFormField label="Given names" name="givenNames" required hint="Separate multiple names with spaces">
              <UInput v-model="state.givenNames" placeholder="Aruna" leading-icon="i-lucide-user" class="w-full" />
            </UFormField>

            <UFormField label="Family name" name="familyName" required help="Their surname or last name.">
              <UInput v-model="state.familyName" placeholder="Kargbo" leading-icon="i-lucide-user-round"
                class="w-full" />
            </UFormField>
          </template>

          <!-- Step 2: Contact -->
          <template v-else-if="step === 1">
            <UFormField label="Email address" name="email" required hint="Record only"
              help="Still required to create their record, even though it won't be used for login.">
              <UInput v-model="state.email" type="email" placeholder="staff@example.com"
                leading-icon="i-lucide-mail" class="w-full" />
            </UFormField>

            <UFormField label="Phone number" name="phone" required hint="International format"
              help="Start with the country code, e.g. +23276123456. No spaces or dashes.">
              <UInput v-model="state.phone" type="tel" placeholder="+23276123456" leading-icon="i-lucide-phone"
                class="w-full" />
            </UFormField>

            <UFormField label="City" name="city" required help="The city or town where they live.">
              <UInput v-model="state.city" placeholder="Freetown" leading-icon="i-lucide-map-pin" class="w-full" />
            </UFormField>

            <UFormField label="Street address" name="street" required help="House number and street name.">
              <UInput v-model="state.street" placeholder="123 Main Street" leading-icon="i-lucide-map"
                class="w-full" />
            </UFormField>
          </template>

          <!-- Step 3: Employment -->
          <template v-else>
            <UFormField label="Staff ID" name="staffId" required hint="Must be unique"
              help="The ID the school assigned them. Payroll and attendance use it, so it can't match another staff member.">
              <UInput v-model="state.staffId" placeholder="STAFF001" leading-icon="i-lucide-id-card"
                class="w-full" />
            </UFormField>

            <UFormField label="Designation" name="designation" required hint="Role"
              help="Their role on staff, e.g. Accountant, Librarian.">
              <UInput v-model="state.designation" placeholder="e.g. Accountant, Librarian, Security"
                leading-icon="i-lucide-briefcase" class="w-full" />
            </UFormField>
          </template>
        </div>

        <StudentAddFooter :show-back="step > 0" :loading="isLoading"
          :next-label="step === steps.length - 1 ? 'Add staff' : 'Continue'" @back="back" />
      </UForm>
    </UCard>

    <p class="px-1 text-center text-xs text-muted">
      Will this person teach a class or log in themselves?
      <NuxtLink to="/teachers/add" class="text-primary underline">Add Teacher</NuxtLink> instead.
    </p>
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup'
import type { FormSubmitEvent } from '#ui/types'

const teacherStore = useTeacherStore()
const { success, error } = useNotify()

const isLoading = ref(false)
const formRef = ref()
const step = ref(0)
const stepperEl = ref<HTMLElement | null>(null)

const steps = [
  {
    title: 'Personal',
    sub: 'Basic details',
    icon: 'i-lucide-user',
    heading: 'Personal Information',
    description: "Enter the staff member's basic details.",
    tipTitle: 'Use their official name',
    tip: 'Enter the name as it appears on their ID or certificate.'
  },
  {
    title: 'Contact',
    sub: 'Email & address',
    icon: 'i-lucide-phone',
    heading: 'Contact Information',
    description: 'Used to identify their record - not shared with them for login.',
    tipTitle: 'Email is for their record only',
    tip: 'It is still required to create the record, but no password or welcome email is sent.'
  },
  {
    title: 'Employment',
    sub: 'Role',
    icon: 'i-lucide-briefcase',
    heading: 'Employment Information',
    description: "Enter the staff member's role at the school.",
    tipTitle: 'Payroll and attendance use this',
    tip: 'The staff ID must be unique, and the designation is their role, such as Accountant or Librarian.'
  }
]

type StaffForm = {
  title: string
  givenNames: string
  familyName: string
  gender: string
  email: string
  phone: string
  city: string
  street: string
  staffId: string
  designation: string
}

const state = reactive<StaffForm>({
  title: '',
  givenNames: '',
  familyName: '',
  gender: '',
  email: '',
  phone: '',
  city: '',
  street: '',
  staffId: '',
  designation: ''
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

const schema = yup.object({
  title: yup.string().required('Title is required'),

  givenNames: yup
    .string()
    .required('Given names are required'),

  familyName: yup
    .string()
    .required('Family name is required'),

  gender: yup
    .string()
    .required('Gender is required'),

  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),

  phone: yup
    .string()
    .required('Phone number is required')
    .matches(
      /^\+?[1-9]\d{1,14}$/,
      'Invalid phone number format'
    ),

  city: yup
    .string()
    .required('City is required'),

  street: yup
    .string()
    .required('Street address is required'),

  staffId: yup
    .string()
    .required('Staff ID is required'),

  designation: yup
    .string()
    .required('Designation is required')
})

// Each step only validates its own fields.
const stepFields: (keyof StaffForm)[][] = [
  ['title', 'givenNames', 'familyName', 'gender'],
  ['email', 'phone', 'city', 'street'],
  ['staffId', 'designation']
]
const currentSchema = computed(() => schema.pick(stepFields[step.value] as any))

function back() {
  if (step.value > 0) step.value--
}

// Completed steps can be revisited from the stepper; forward moves go through validation.
function goTo(i: number) {
  if (i < step.value) step.value = i
}

watch(step, () => stepperEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))

async function onSubmit(
  event: FormSubmitEvent<StaffForm>
) {
  if (step.value < steps.length - 1) {
    step.value++
    return
  }

  isLoading.value = true

  try {
    await teacherStore.create({
      ...state,
      classMaster: '',
      sendWelcomeEmail: false,
      teaching: false
    })

    success('Staff added successfully')

    await teacherStore.fetchAll()

    await navigateTo('/teachers')
  } catch (err: any) {
    error(
      err?.message || 'Failed to add staff'
    )
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  useAppStore().setTitle('Add Staff');
  useAppStore().setBack('/teachers')
  document.title = 'Add Staff | Teachers | Skultem'
})

// Missing entirely before - see teachers/index.vue's guard for why.
definePageMeta({
  role: [Role.ADMIN, Role.PRINCIPAL, Role.SUPER_ADMIN, Role.OWNER, Role.PROPRIETOR]
})
</script>
