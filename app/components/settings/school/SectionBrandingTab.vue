<template>
  <div class="space-y-4">
    <UAlert color="info" variant="subtle" icon="lucide:info" title="Each section can have its own identity"
      description="Anything you leave empty here uses the school's own logo, principal, signature or address. Reports, report cards, receipts, ID cards and payslips for a section's classes and staff print that section's details, and staff clock in at their section's own location." />

    <UCard v-if="loading">
      <USkeleton class="h-40 w-full" />
    </UCard>

    <UCard v-else-if="!visibleSections.length">
      <p class="text-sm text-muted">You aren't assigned to a management section yet.</p>
    </UCard>

    <UCard v-for="section in visibleSections" :key="section.id">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="font-medium text-highlighted">{{ section.name }}</p>
            <p class="text-xs text-muted">{{ section.levels.map(levelLabel).join(' • ') }}</p>
          </div>
          <UButton label="Save" icon="lucide:save" size="sm" :loading="savingId === section.id"
            :disabled="!!savingId" @click="save(section)" />
        </div>
      </template>

      <div v-if="forms[section.id]" class="space-y-5">
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <UploadTile :label="`${section.name} Logo`"
            :hint="isInherited(section.id, 'logo') ? 'Using the school logo' : forms[section.id]!.logoPreview ? 'Remove to use the school logo' : 'Square PNG'"
            :src="forms[section.id]!.logoPreview || schoolDefaults?.logo || ''"
            :inherited="isInherited(section.id, 'logo')" @select="(f) => onFile(section.id, 'logo', f)"
            @clear="clearFile(section.id, 'logo')" />
          <UploadTile label="Principal Signature"
            :hint="isInherited(section.id, 'signature') ? 'Using the school signature' : forms[section.id]!.signaturePreview ? 'Remove to use the school signature' : 'Transparent PNG'"
            :src="forms[section.id]!.signaturePreview || schoolDefaults?.principalSignature || ''"
            :inherited="isInherited(section.id, 'signature')" muted @select="(f) => onFile(section.id, 'signature', f)"
            @clear="clearFile(section.id, 'signature')" />
        </div>

        <UFormField label="Principal Name"
          :help="schoolDefaults?.principalName ? 'Leave empty to use the school principal.' : 'The school has no principal set - this section prints its own.'">
          <UInput v-model="forms[section.id]!.principalName"
            :placeholder="schoolDefaults?.principalName || 'e.g. Mrs. A. Kamara'" class="w-full" />
        </UFormField>

        <div class="border-t border-default pt-5">
          <p class="mb-3 text-sm font-medium text-highlighted">Location</p>
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UFormField label="Street">
              <UInput v-model="forms[section.id]!.street" :placeholder="schoolDefaults?.address?.street || 'e.g. 12 Wilkinson Road'" class="w-full" />
            </UFormField>
            <UFormField label="City">
              <UInput v-model="forms[section.id]!.city" :placeholder="schoolDefaults?.address?.city || 'e.g. Freetown'" class="w-full" />
            </UFormField>
            <UFormField label="Region">
              <UInput v-model="forms[section.id]!.region" :placeholder="schoolDefaults?.address?.region || 'e.g. Western Area'" class="w-full" />
            </UFormField>
            <UFormField label="District">
              <UInput v-model="forms[section.id]!.district" :placeholder="schoolDefaults?.address?.district || 'e.g. Freetown'" class="w-full" />
            </UFormField>
            <UFormField label="Chiefdom">
              <UInput v-model="forms[section.id]!.chiefdom" :placeholder="schoolDefaults?.address?.chiefdom || 'e.g. Freetown Municipality'" class="w-full" />
            </UFormField>
          </div>
          <p class="mt-2 text-xs text-muted">
            <template v-if="schoolAddressLine">Leave all empty to use the school address ({{ schoolAddressLine }}) - shown greyed out above.</template>
            <template v-else>Leave all empty to use the school address.</template>
          </p>
        </div>

        <!-- Staff clock-in geofence for this section's own campus (Staff & HR module). -->
        <SettingsSchoolSectionClockInLocation v-if="hrInstalled && !loadingLocations" :section-id="section.id"
          :section-name="section.name" :initial="locations[section.id]"
          @saved="(l) => locations[section.id] = l" />
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
// Settings > Section Branding (SECTION_BASED schools only). A school run from different places can
// give each management section its own logo, principal, signature and location. Owner-level users
// see and edit every section; a section-limited Admin sees only their own section(s) - the backend
// (PUT /school/structure/sections/{id}/branding) enforces the same.
const props = defineProps<{
  schoolDefaults?: { logo?: string, principalName?: string, principalSignature?: string, address?: SectionAddress | null } | null
}>()

const { success, error: toastError } = useNotify()
const { structure, load, set } = useSchoolStructure()
const { scope, load: loadScope } = useMyScope()

type Form = {
  principalName: string
  street: string
  city: string
  region: string
  district: string
  chiefdom: string
  logoPreview: string
  signaturePreview: string
  logoFile?: File
  signatureFile?: File
  removeLogo: boolean
  removeSignature: boolean
}

const { isInstalled } = useModules()
const hrInstalled = computed(() => isInstalled(ModuleKey.STAFF_HR))
const locations = reactive<Record<string, AttendanceLocationSettings>>({})
const loadingLocations = ref(true)

const loading = ref(true)
const savingId = ref('')
const forms = reactive<Record<string, Form>>({})

const visibleSections = computed(() => {
  const sections = structure.value?.sections ?? []
  if (!scope.value || scope.value.wholeSchool) return sections
  return sections.filter(s => scope.value!.sectionIds.includes(s.id))
})

const schoolAddressLine = computed(() => {
  const a = props.schoolDefaults?.address
  if (!a) return ''
  return [a.street, a.city, a.chiefdom, a.district, a.region].filter(p => p && p.trim()).join(', ')
})

// True when the section has no value of its own but the school does, so the card is showing the
// school's default (faded) - the admin can leave it, or upload their own to override it.
function isInherited(id: string, key: 'logo' | 'signature') {
  const form = forms[id]
  if (!form) return false
  return key === 'logo'
    ? !form.logoPreview && !!props.schoolDefaults?.logo
    : !form.signaturePreview && !!props.schoolDefaults?.principalSignature
}

function toForm(s: ManagementSectionView): Form {
  return {
    principalName: s.principalName ?? '',
    street: s.address?.street ?? '',
    city: s.address?.city ?? '',
    region: s.address?.region ?? '',
    district: s.address?.district ?? '',
    chiefdom: s.address?.chiefdom ?? '',
    logoPreview: s.logo ?? '',
    signaturePreview: s.principalSignature ?? '',
    removeLogo: false,
    removeSignature: false
  }
}

function syncForms() {
  for (const s of structure.value?.sections ?? []) forms[s.id] = toForm(s)
}

function onFile(id: string, key: 'logo' | 'signature', file: File) {
  const form = forms[id]
  if (!form) return
  const reader = new FileReader()
  reader.onload = (e) => {
    const url = e.target?.result as string
    if (key === 'logo') form.logoPreview = url
    else form.signaturePreview = url
  }
  reader.readAsDataURL(file)
  if (key === 'logo') {
    form.logoFile = file
    form.removeLogo = false
  } else {
    form.signatureFile = file
    form.removeSignature = false
  }
}

function clearFile(id: string, key: 'logo' | 'signature') {
  const form = forms[id]
  if (!form) return
  if (key === 'logo') {
    form.logoFile = undefined
    form.logoPreview = ''
    form.removeLogo = true
  } else {
    form.signatureFile = undefined
    form.signaturePreview = ''
    form.removeSignature = true
  }
}

async function save(section: ManagementSectionView) {
  const form = forms[section.id]
  if (!form) return
  savingId.value = section.id
  try {
    const body = new FormData()
    body.append('principalName', form.principalName)
    body.append('street', form.street)
    body.append('city', form.city)
    body.append('region', form.region)
    body.append('district', form.district)
    body.append('chiefdom', form.chiefdom)
    body.append('removeLogo', String(form.removeLogo))
    body.append('removeSignature', String(form.removeSignature))
    if (form.logoFile) body.append('logo', form.logoFile)
    if (form.signatureFile) body.append('principalSignature', form.signatureFile)

    const res = await SchoolApi().updateSectionBranding(section.id, body)
    if (!res) return
    set(res)
    syncForms()
    // Reports cache the resolved logo for the session - drop it so the change shows next time.
    useReportLogo().reset()
    success(`${section.name} details saved`)
  } catch (err: any) {
    toastError(err?.message || 'Failed to save section details')
  } finally {
    savingId.value = ''
  }
}

onMounted(async () => {
  await Promise.all([load(true), loadScope()])
  syncForms()
  loading.value = false

  if (hrInstalled.value) {
    const rows = await TeacherAttendanceApi().getSectionLocationSettings().catch(() => [])
    for (const row of rows ?? []) if (row.managementSectionId) locations[row.managementSectionId] = row
  }
  loadingLocations.value = false
})
</script>
