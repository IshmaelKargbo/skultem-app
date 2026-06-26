<template>
  <div class="space-y-6 mt-6 p-4">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          Create Report Card Template
        </h1>

        <p class="mt-1 text-sm text-muted">
          Configure a new report card design for your school.
        </p>
      </div>

      <div class="flex gap-3">
        <UButton variant="outline" color="neutral" icon="i-lucide-arrow-left" to="/report-cards/templates">
          Back
        </UButton>

        <UButton color="primary" icon="i-lucide-save" :loading="saving" @click="saveTemplate">
          Save Template
        </UButton>
      </div>

    </div>

    <div class="grid gap-6 lg:grid-cols-3">

      <!-- Left -->
      <div class="lg:col-span-2 space-y-6">

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-file-text" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Template Information
              </h3>
            </div>
          </template>

          <div class="space-y-4">

            <UFormField label="Template Name" required>
              <UInput v-model="form.name" placeholder="e.g. Primary School Template" icon="i-lucide-text"
                class="w-full" />
            </UFormField>

            <UFormField label="Description">
              <UTextarea v-model="form.description" :rows="3"
                placeholder="Briefly describe when this template should be used..." class="w-full" />
            </UFormField>

            <div class="grid gap-4 sm:grid-cols-2">

              <UFormField label="School Level" required>
                <USelect v-model="form.level" :items="levels" icon="i-lucide-school" class="w-full" />
              </UFormField>

              <UFormField label="Status" required>
                <USelect v-model="form.status" :items="statuses"
                  :icon="form.status === 'Active' ? 'i-lucide-check-circle' : 'i-lucide-file-pen'" class="w-full" />
              </UFormField>

            </div>

          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-layout-list" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Sections
              </h3>
            </div>
          </template>

          <p class="text-sm text-muted -mt-1 mb-4">
            Choose which sections appear on the printed report card.
          </p>

          <div class="grid gap-3 sm:grid-cols-2">

            <label v-for="section in sections" :key="section.key"
              class="flex items-start gap-3 rounded-xl border border-default p-3.5 cursor-pointer transition-colors hover:bg-muted/40">
              <UCheckbox :model-value="form[section.key]" class="mt-0.5"
                @update:model-value="(value) => (form[section.key] = value)" />

              <div class="flex items-start gap-2.5">
                <UIcon :name="section.icon" class="size-4 mt-0.5 shrink-0 text-muted" />
                <div>
                  <p class="text-sm font-medium">{{ section.label }}</p>
                  <p class="text-xs text-muted">{{ section.hint }}</p>
                </div>
              </div>
            </label>

          </div>
        </UCard>

      </div>

      <!-- Right -->
      <div class="space-y-6 lg:sticky lg:top-6 lg:self-start">

        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-palette" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Theme
              </h3>
            </div>
          </template>

          <div class="space-y-4">

            <UFormField label="Primary Color">
              <div class="flex items-center gap-3">
                <UInput v-model="form.color" type="color" class="h-10 w-14 shrink-0 p-1" />
                <UInput v-model="form.color" placeholder="#2563eb" class="w-full font-mono text-sm" />
              </div>
            </UFormField>

            <UFormField label="Logo URL">
              <UInput v-model="form.logo" placeholder="https://..." icon="i-lucide-image" class="w-full" />
            </UFormField>

          </div>

        </UCard>

        <UCard :ui="{ body: 'p-0' }">

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-eye" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Live Preview
              </h3>
            </div>
          </template>

          <div class="p-5">
            <div class="overflow-hidden rounded-xl border border-default"
              :style="{ borderTopColor: form.color, borderTopWidth: '4px' }">

              <div class="bg-muted/40 p-6 text-center">

                <img v-if="form.logo" :src="form.logo" class="h-14 mx-auto object-contain" alt="Logo">

                <div v-else class="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-muted">
                  <UIcon name="i-lucide-image" class="size-6 text-muted" />
                </div>

                <h3 class="mt-3 font-bold">
                  {{ form.name || 'Template Name' }}
                </h3>

                <p class="text-xs text-muted">
                  {{ form.level }} Report Card
                </p>

                <UBadge class="mt-2" :color="form.status === 'Active' ? 'success' : 'neutral'" variant="subtle"
                  size="sm">
                  {{ form.status }}
                </UBadge>

              </div>

              <div class="space-y-2 p-4">

                <p class="text-xs font-medium uppercase tracking-wide text-muted">
                  Includes
                </p>

                <div v-if="activeSections.length" class="flex flex-wrap gap-1.5">
                  <UBadge v-for="section in activeSections" :key="section.key" color="neutral" variant="subtle"
                    size="sm">
                    {{ section.label }}
                  </UBadge>
                </div>

                <p v-else class="text-xs text-muted">
                  No sections selected yet.
                </p>

              </div>

            </div>
          </div>

        </UCard>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
const { success, error: notifyError } = useNotify()
const router = useRouter()

const saving = ref(false)

const levels = [
  'Primary',
  'Junior Secondary',
  'Senior Secondary',
  'International'
]

const statuses = [
  'Draft',
  'Active'
]

interface SectionConfig {
  key: 'showAttendance' | 'showRemarks' | 'showPosition' | 'showSignatures' | 'showGrades'
  label: string
  hint: string
  icon: string
}

const sections: SectionConfig[] = [
  {
    key: 'showAttendance',
    label: 'Attendance',
    hint: 'Days present, absent, and late',
    icon: 'i-lucide-calendar-check'
  },
  {
    key: 'showRemarks',
    label: 'Teacher Remarks',
    hint: 'Comments from the class teacher',
    icon: 'i-lucide-message-square'
  },
  {
    key: 'showPosition',
    label: 'Class Position',
    hint: 'Student rank within the class',
    icon: 'i-lucide-trophy'
  },
  {
    key: 'showSignatures',
    label: 'Signatures',
    hint: 'Teacher and principal sign-off',
    icon: 'i-lucide-signature'
  },
  {
    key: 'showGrades',
    label: 'Grade Scale',
    hint: 'Reference table for grade meanings',
    icon: 'i-lucide-list-ordered'
  }
]

const form = reactive({
  name: '',
  description: '',
  level: 'Primary',
  status: 'Draft',
  color: '#2563eb',
  logo: '',

  showAttendance: true,
  showRemarks: true,
  showPosition: true,
  showSignatures: true,
  showGrades: true
})

const activeSections = computed(() =>
  sections.filter(section => form[section.key])
)

function validate(): string | null {
  if (!form.name.trim()) {
    return 'Template name is required.'
  }

  if (!form.level) {
    return 'School level is required.'
  }

  return null
}

async function saveTemplate() {
  const validationError = validate()

  if (validationError) {
    notifyError(validationError)
    return
  }

  try {
    saving.value = true

    // TODO: Replace with API request
    console.log(form)

    success('Template saved successfully')

    router.push('/report-cards/templates')
  } catch {
    notifyError('Unable to save template')
  } finally {
    saving.value = false
  }
}
</script>