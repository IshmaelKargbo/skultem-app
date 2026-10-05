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

    <UCard v-for="section in visibleSections" :key="section.id"
      :ui="{ header: 'p-3 sm:p-4', body: isOpen(`${section.id}`, sectionDefault(section)) ? '' : 'hidden' }">
      <template #header>
        <div class="flex items-center justify-between gap-3">
          <button type="button" class="flex min-w-0 flex-1 items-center gap-3 text-left"
            :aria-expanded="isOpen(`${section.id}`, sectionDefault(section))"
            @click="toggle(`${section.id}`, sectionDefault(section))">
            <UIcon name="i-lucide-chevron-down" class="size-4 shrink-0 text-muted transition-transform"
              :class="isOpen(`${section.id}`, sectionDefault(section)) ? 'rotate-180' : ''" />
            <div class="min-w-0">
              <p class="font-medium text-highlighted">{{ section.name }}</p>
              <p class="truncate text-xs text-muted">{{ section.levels.map(levelLabel).join(' • ') }}</p>
            </div>
          </button>
          <UButton label="Save" icon="lucide:save" size="sm" :loading="savingId === section.id"
            :disabled="!!savingId" @click="save(section)" />
        </div>
      </template>

      <div v-if="forms[section.id]" class="divide-y divide-default">
        <!-- Each group of settings folds away so a section isn't one long wall of fields. -->

        <!-- Identity -->
        <div class="py-1">
          <button type="button" class="flex w-full items-center justify-between gap-3 py-3 text-left"
            :aria-expanded="isOpen(`${section.id}:identity`, true)" @click="toggle(`${section.id}:identity`, true)">
            <span>
              <span class="block text-sm font-medium text-highlighted">Logo, principal and phone</span>
              <span class="block text-xs text-muted">{{ identitySummary(section.id) }}</span>
            </span>
            <UIcon name="i-lucide-chevron-down" class="size-4 shrink-0 text-muted transition-transform"
              :class="isOpen(`${section.id}:identity`, true) ? 'rotate-180' : ''" />
          </button>
          <div v-show="isOpen(`${section.id}:identity`, true)" class="space-y-5 pb-4">
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <UploadTile :label="`${section.name} Logo`"
                :hint="isInherited(section.id, 'logo') ? 'Using the school logo' : forms[section.id]!.logoPreview ? 'Remove to use the school logo' : 'Square PNG'"
                :src="forms[section.id]!.logoPreview || schoolDefaults?.logo || ''"
                :inherited="isInherited(section.id, 'logo')" @select="(f) => onFile(section.id, 'logo', f)"
                @clear="clearFile(section.id, 'logo')" />
              <UploadTile label="Principal Signature"
                :hint="isInherited(section.id, 'signature') ? 'Using the school signature' : forms[section.id]!.signaturePreview ? 'Remove to use the school signature' : 'Transparent PNG'"
                :src="forms[section.id]!.signaturePreview || schoolDefaults?.principalSignature || ''"
                :inherited="isInherited(section.id, 'signature')" muted
                @select="(f) => onFile(section.id, 'signature', f)" @clear="clearFile(section.id, 'signature')" />
            </div>

            <UFormField label="Principal Name"
              :help="schoolDefaults?.principalName ? 'Leave empty to use the school principal.' : 'The school has no principal set - this section prints its own.'">
              <UInput v-model="forms[section.id]!.principalName"
                :placeholder="schoolDefaults?.principalName || 'e.g. Mrs. A. Kamara'" class="w-full" />
            </UFormField>

            <UFormField label="Phone"
              :help="schoolDefaults?.phone ? 'Leave empty to use the school phone.' : 'Printed on the back of this section\'s ID cards.'">
              <UInput v-model="forms[section.id]!.phone" type="tel"
                :placeholder="schoolDefaults?.phone || 'e.g. +232 76 123 456'" class="w-full" />
            </UFormField>
          </div>
        </div>

        <!-- Location -->
        <div class="py-1">
          <button type="button" class="flex w-full items-center justify-between gap-3 py-3 text-left"
            :aria-expanded="isOpen(`${section.id}:location`)" @click="toggle(`${section.id}:location`)">
            <span>
              <span class="block text-sm font-medium text-highlighted">Location</span>
              <span class="block text-xs text-muted">{{ locationSummary(section.id) }}</span>
            </span>
            <UIcon name="i-lucide-chevron-down" class="size-4 shrink-0 text-muted transition-transform"
              :class="isOpen(`${section.id}:location`) ? 'rotate-180' : ''" />
          </button>
          <div v-show="isOpen(`${section.id}:location`)" class="pb-4">
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
        </div>

        <!-- Grade approval -->
        <div class="py-1">
          <button type="button" class="flex w-full items-center justify-between gap-3 py-3 text-left"
            :aria-expanded="isOpen(`${section.id}:grades`)" @click="toggle(`${section.id}:grades`)">
            <span>
              <span class="block text-sm font-medium text-highlighted">Grade approval</span>
              <span class="block text-xs text-muted">{{ gradeSummary(section.id) }}</span>
            </span>
            <UIcon name="i-lucide-chevron-down" class="size-4 shrink-0 text-muted transition-transform"
              :class="isOpen(`${section.id}:grades`) ? 'rotate-180' : ''" />
          </button>
          <div v-show="isOpen(`${section.id}:grades`)" class="pb-4">
            <UFormField label="Who approves grades in this section?"
              :help="`After a subject teacher submits grades. 'Same as the school' uses the school's choice (${schoolDefaults?.gradeApprover === 'ADMIN' ? 'an admin' : 'the class master'}).`">
              <USelectMenu v-model="forms[section.id]!.gradeApprover" :items="gradeApproverOptions" value-key="value"
                label-key="label" class="w-full" />
            </UFormField>
          </div>
        </div>

        <!-- Attendance rules -->
        <div class="py-1">
          <button type="button" class="flex w-full items-center justify-between gap-3 py-3 text-left"
            :aria-expanded="isOpen(`${section.id}:attendance`)" @click="toggle(`${section.id}:attendance`)">
            <span>
              <span class="block text-sm font-medium text-highlighted">Attendance rules</span>
              <span class="block text-xs text-muted">{{ attendanceSummary(section.id) }}</span>
            </span>
            <UIcon name="i-lucide-chevron-down" class="size-4 shrink-0 text-muted transition-transform"
              :class="isOpen(`${section.id}:attendance`) ? 'rotate-180' : ''" />
          </button>
          <div v-show="isOpen(`${section.id}:attendance`)" class="pb-4">
            <p class="mb-3 text-xs text-muted">
              Leave a box empty to use the school's setting (shown greyed out). Fill it in if this section works
              differently from the rest of the school.
            </p>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <UFormField label="Minimum attendance %"
                help="Students in this section whose attendance falls below this are flagged.">
                <UInput v-model.number="forms[section.id]!.attendanceThreshold" type="number" min="0" max="100"
                  step="0.1" :placeholder="String(schoolDefaults?.attendanceThreshold ?? 75)" class="w-full" />
              </UFormField>
              <UFormField label="Days to look back"
                help="How many of a student's most recent school days we look at (weekends and holidays don't count).">
                <UInput v-model.number="forms[section.id]!.attendanceWindowDays" type="number" min="5" max="60"
                  :placeholder="String(schoolDefaults?.attendanceWindowDays ?? 20)" class="w-full" />
              </UFormField>
              <UFormField label="Minimum marked days"
                help="A student needs at least this many marked days before they can be flagged.">
                <UInput v-model.number="forms[section.id]!.attendanceMinDays" type="number" min="1" max="60"
                  :placeholder="String(schoolDefaults?.attendanceMinDays ?? 5)" class="w-full" />
              </UFormField>
              <UFormField label="Absent days in a row"
                help="This many school days absent in a row marks a student Critical straight away.">
                <UInput v-model.number="forms[section.id]!.attendanceStreakDays" type="number" min="2" max="10"
                  :placeholder="String(schoolDefaults?.attendanceStreakDays ?? 3)" class="w-full" />
              </UFormField>
            </div>
          </div>
        </div>

        <!-- Staff clock-in geofence for this section's own campus (Staff & HR module). -->
        <div v-if="hrInstalled && !loadingLocations" class="py-1">
          <button type="button" class="flex w-full items-center justify-between gap-3 py-3 text-left"
            :aria-expanded="isOpen(`${section.id}:clockin`)" @click="toggle(`${section.id}:clockin`)">
            <span>
              <span class="block text-sm font-medium text-highlighted">Staff clock-in location</span>
              <span class="block text-xs text-muted">{{ locations[section.id] ? 'Set for this section' : 'Uses the school location' }}</span>
            </span>
            <UIcon name="i-lucide-chevron-down" class="size-4 shrink-0 text-muted transition-transform"
              :class="isOpen(`${section.id}:clockin`) ? 'rotate-180' : ''" />
          </button>
          <div v-show="isOpen(`${section.id}:clockin`)" class="pb-4">
            <SettingsSchoolSectionClockInLocation :section-id="section.id" :section-name="section.name"
              :initial="locations[section.id]" @saved="(l) => locations[section.id] = l" />
          </div>
        </div>
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
  schoolDefaults?: { logo?: string, principalName?: string, principalSignature?: string, phone?: string, gradeApprover?: string, attendanceThreshold?: number, attendanceWindowDays?: number, attendanceMinDays?: number, attendanceStreakDays?: number, address?: SectionAddress | null } | null
}>()

const gradeApproverOptions = [
  { label: 'Same as the school', value: 'INHERIT' },
  { label: 'The class master', value: 'CLASS_MASTER' },
  { label: 'An admin', value: 'ADMIN' }
]

// Which groups are folded open. Keys are `${sectionId}` (the whole card) or `${sectionId}:group`. A key that
// was never toggled uses its default: a card is open when it's the only/first one, identity opens with it,
// everything else starts folded away.
const openState = reactive<Record<string, boolean>>({})
function isOpen(key: string, fallback = false) {
  return openState[key] ?? fallback
}
function toggle(key: string, fallback = false) {
  openState[key] = !isOpen(key, fallback)
}
function sectionDefault(section: ManagementSectionView) {
  return visibleSections.value[0]?.id === section.id
}

const { success, error: toastError } = useNotify()
const { structure, load, set } = useSchoolStructure()
const { scope, load: loadScope } = useMyScope()

type Form = {
  principalName: string
  phone: string
  // 'INHERIT' = use the school's choice
  gradeApprover: 'INHERIT' | 'CLASS_MASTER' | 'ADMIN'
  // '' = not set, use the school's
  attendanceThreshold: number | ''
  attendanceWindowDays: number | ''
  attendanceMinDays: number | ''
  attendanceStreakDays: number | ''
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
// One-line summaries shown on a folded group, so you can tell what's set without opening it.
function identitySummary(id: string) {
  const f = forms[id]
  if (!f) return ''
  const own = [f.logoPreview && 'logo', f.signaturePreview && 'signature', f.principalName && 'principal', f.phone && 'phone']
    .filter(Boolean) as string[]
  return own.length ? `Own ${own.join(', ')}` : 'Uses the school\'s logo, principal and phone'
}

function locationSummary(id: string) {
  const f = forms[id]
  if (!f) return ''
  const line = [f.street, f.city].filter(p => p && String(p).trim()).join(', ')
  return line || 'Uses the school address'
}

function gradeSummary(id: string) {
  const f = forms[id]
  if (!f) return ''
  if (f.gradeApprover === 'INHERIT') {
    return `Same as the school (${props.schoolDefaults?.gradeApprover === 'ADMIN' ? 'an admin' : 'the class master'})`
  }
  return f.gradeApprover === 'ADMIN' ? 'An admin approves' : 'The class master approves'
}

function attendanceSummary(id: string) {
  const f = forms[id]
  if (!f) return ''
  const set = [f.attendanceThreshold, f.attendanceWindowDays, f.attendanceMinDays, f.attendanceStreakDays]
    .filter(v => v !== '' && v != null).length
  return set ? `${set} of 4 set for this section` : 'Same as the school'
}

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
    phone: s.phone ?? '',
    gradeApprover: s.gradeApprover ?? 'INHERIT',
    attendanceThreshold: s.attendanceThreshold ?? '',
    attendanceWindowDays: s.attendanceWindowDays ?? '',
    attendanceMinDays: s.attendanceMinDays ?? '',
    attendanceStreakDays: s.attendanceStreakDays ?? '',
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
    body.append('phone', form.phone)
    body.append('street', form.street)
    body.append('city', form.city)
    body.append('region', form.region)
    body.append('district', form.district)
    body.append('chiefdom', form.chiefdom)
    body.append('removeLogo', String(form.removeLogo))
    body.append('removeSignature', String(form.removeSignature))
    if (form.logoFile) body.append('logo', form.logoFile)
    if (form.signatureFile) body.append('principalSignature', form.signatureFile)

    const branded = await SchoolApi().updateSectionBranding(section.id, body)
    if (!branded) return

    // Empty box = no override: send null so the section goes back to the school's value.
    const orNull = (v: number | '') => (v === '' || Number.isNaN(v) ? null : v)
    const res = await SchoolApi().updateSectionAttendanceRules(section.id, {
      attendanceThreshold: orNull(form.attendanceThreshold),
      attendanceWindowDays: orNull(form.attendanceWindowDays),
      attendanceMinDays: orNull(form.attendanceMinDays),
      attendanceStreakDays: orNull(form.attendanceStreakDays)
    })
    if (!res) return

    const approved = await SchoolApi().updateSectionGradeApprover(section.id,
      form.gradeApprover === 'INHERIT' ? null : form.gradeApprover)
    if (!approved) return
    set(approved)
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
