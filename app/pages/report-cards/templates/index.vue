<template>
  <div class="space-y-6 mt-6 p-4 md:px-6">

    <!-- Header -->
    <Heading title="Report Card Design" subtitle="Configure the report card layout used across your school.">
      <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" to="/report-cards" class="justify-center">
        Back
      </UButton>

      <UButton icon="i-lucide-save" color="primary" :loading="saving" class="justify-center" @click="save">
        Save Settings
      </UButton>
    </Heading>

    <div class="grid gap-6 lg:grid-cols-3">

      <!-- Left -->
      <div class="lg:col-span-2 space-y-6">

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
            Choose which sections appear on generated report cards.
          </p>

          <div class="grid gap-3 sm:grid-cols-2">
            <label v-for="section in sections" :key="section.key"
              class="flex items-start gap-3 rounded-xl border border-default p-3.5 cursor-pointer transition-colors hover:bg-muted/40">
              <UCheckbox :model-value="settings[section.key]" class="mt-0.5"
                @update:model-value="(value) => (settings[section.key] = !!value)" />

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

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-palette" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Theme
              </h3>
            </div>
          </template>

          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Header Color">
              <div class="flex items-center gap-3">
                <UInput v-model="settings.headerColor" type="color" class="h-10 w-14 shrink-0 p-1" />
                <UInput v-model="settings.headerColor" placeholder="#1878c5" class="w-full font-mono text-sm" />
              </div>
            </UFormField>

            <UFormField label="Logo URL">
              <UInput v-model="settings.logoUrl" placeholder="https://..." icon="i-lucide-image" class="w-full" />
            </UFormField>

            <UFormField label="Footer Note" class="sm:col-span-2">
              <UInput v-model="settings.footerNote" placeholder="e.g. Property of King's West International School"
                class="w-full" />
            </UFormField>
          </div>
        </UCard>

      </div>

      <!-- Right -->
      <div class="space-y-6 lg:sticky lg:top-6 lg:self-start">

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
              :style="{ borderTopColor: settings.headerColor, borderTopWidth: '4px' }">

              <div class="bg-muted/40 p-6 text-center">
                <img v-if="settings.logoUrl" :src="settings.logoUrl" class="h-14 mx-auto object-contain" alt="Logo">

                <div v-else class="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-muted">
                  <UIcon name="i-lucide-image" class="size-6 text-muted" />
                </div>

                <h3 class="mt-3 font-bold">
                  Report Card
                </h3>

                <p class="text-xs text-muted">
                  Preview of the active design
                </p>
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
const store = useReportCardSettingStore()
const { settings } = storeToRefs(store)

const saving = ref(false)

interface SectionConfig {
  key: 'showAttendance' | 'showRemarks' | 'showPosition' | 'showSignatures' | 'showGradeScale'
  label: string
  hint: string
  icon: string
}

const sections: SectionConfig[] = [
  {
    key: 'showAttendance',
    label: 'Attendance',
    hint: 'Attendance percentage for the term',
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
    key: 'showGradeScale',
    label: 'Grade Scale',
    hint: 'Reference table for grade meanings',
    icon: 'i-lucide-list-ordered'
  }
]

const activeSections = computed(() => sections.filter(section => settings.value[section.key]))

async function save() {
  saving.value = true
  try {
    await store.save()
    success('Report card settings saved')
    router.push('/report-cards')
  } catch (err: any) {
    notifyError(err?.message || 'Unable to save report card settings')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  useAppStore().setTitle('Report Card Design')
  await store.fetch()
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
