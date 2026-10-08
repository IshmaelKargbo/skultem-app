<template>
  <div class="space-y-4 px-4 md:px-6">
    <!-- Section nav and the Student/Staff toggle share a row on desktop (nav left, toggle right); on a
         phone they stack, with the toggle spanning the full width. -->
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <IdCardsSectionNav />
      <!-- Same pill-tab look as the app's Tab component (that one is link-based, this switches a local value). -->
      <div class="flex w-full gap-1 rounded-3xl md:inline-flex md:w-auto border border-gray-200 bg-white p-1.5 dark:border-gray-800 dark:bg-gray-900">
        <button v-for="tab in cardTypeTabs" :key="tab.value" type="button"
          class="flex flex-1 items-center justify-center gap-1.5 rounded-3xl px-4 py-2 md:flex-none text-[12px] sm:text-sm whitespace-nowrap transition-all duration-200"
          :class="cardType === tab.value
            ? 'bg-secondary-100 text-secondary-600 font-semibold dark:bg-secondary-800 dark:text-secondary-200'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'"
          @click="cardType = tab.value">
          <UIcon :name="tab.icon" class="size-4 shrink-0" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Left: the settings form -->
      <div>
        <IdCardsIDCardSettings
          v-model="open"
          :settings="uiSettings"
          :active-fields="activeFields"
          :fields-label="cardType === 'staff' ? 'Staff' : 'Student'"
          :default-settings="uiSettings"
          @update:settings="updateSettings"
          @update:active-fields="updateFields"
          @save="save"
          @close="onClose"
        />
      </div>

      <!-- Right: live preview, same pattern as Payslip Design / Receipt Design -
           a real render of the card component itself (not a second, lower-fidelity
           mockup of the design), fed with sample data so it updates as settings change.
           Given the extra column, the card renders large enough to actually check. -->
      <div class="lg:col-span-2 lg:sticky lg:top-6 lg:self-start space-y-2">
        <div class="flex items-center gap-2 px-1">
          <UIcon name="i-lucide-eye" class="size-5 text-primary" />
          <h3 class="font-semibold">Live Preview</h3>
        </div>

        <IdCardsIDCardPreview :template="mockTemplate" :settings="uiSettings" :active-fields="activeFields"
          :card-type="cardType" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const { success, error: toastError } = useNotify()
const store = useIdCardStore()
const { school, hydrateFromCache } = useSchoolInfo()

// The branding the preview shows: the section the user is in (the one an owner is viewing, or the
// one a section-limited user is scoped to) supplies its own logo / principal / signature / address
// where it has them - anything it leaves blank falls back to the school's. Cards for a person
// already resolve this per student/staff member (see [id].vue); this keeps the design preview
// consistent with them.
const { viewingSection } = useSectionView()
const { scope: myScope, load: loadMyScope } = useMyScope()
const { structure, load: loadStructure } = useSchoolStructure()
const activeSection = computed(() => {
  if (structure.value?.managementModel !== 'SECTION_BASED') return null
  if (viewingSection.value) return viewingSection.value
  if (!myScope.value || myScope.value.wholeSchool) return null
  return structure.value.sections.find(sec => sec.levels.some(l => myScope.value!.levels.includes(l))) ?? null
})

// The cached school (useSchoolInfo) only carries the basics - the principal's signature needs the full record.
const fullSchool = ref<any>()

const open = ref(true)
const cardType = ref<'student' | 'staff'>('student')
const cardTypeTabs = [
  { value: 'student', label: 'Student ID', icon: 'i-lucide-graduation-cap' },
  { value: 'staff', label: 'Staff ID', icon: 'i-lucide-briefcase' }
] as const
const activeFields = computed(() => (cardType.value === 'staff' ? store.staffFields : store.fields))

const uiSettings = reactive({ ...store.settings, preset: 'modern' })

watch(() => store.settings, (val) => Object.assign(uiSettings, val), { deep: true })

function updateSettings(newSettings: typeof uiSettings) {
  Object.assign(uiSettings, newSettings)
  Object.assign(store.settings, newSettings)
}

function updateFields(newFields: any[]) {
  if (cardType.value === 'staff') store.staffFields = newFields
  else store.fields = newFields
}

async function save() {
  try {
    await store.save()
    success('Settings saved')
    router.push('/id-cards')
  } catch (err: any) {
    toastError(err?.message || 'Failed to save settings')
  }
}

function onClose() {
  router.push('/id-cards')
}

const mockStudent = {
  givenNames: 'Aminata',
  familyName: 'Kamara',
  admissionNumber: 'STU-2026-0042',
  className: 'JSS 1',
  gender: 'FEMALE',
  dateOfBirth: '2014-03-12',
  photo: '',
  guardianPhone: '+232 76 123 456'
}

// Sample staff member - same idea as mockStudent above, just for the Staff ID tab.
const mockStaff = {
  givenNames: 'Alieu',
  familyName: 'Kamara',
  staffId: 'THR-2026-0001',
  designation: 'Mathematics Teacher',
  gender: 'MALE',
  photo: '',
  phone: '+232 78 987 654'
}

const previewValidUntil = computed(() => {
  const years = uiSettings.validityYears || 1
  const date = new Date()
  date.setFullYear(date.getFullYear() + years)
  return date.toISOString()
})

function addressLine(a?: { street?: string | null, city?: string | null, chiefdom?: string | null, district?: string | null, region?: string | null } | null) {
  if (!a) return ''
  return [a.street, a.city, a.chiefdom, a.district, a.region].filter(p => p && p.trim()).join(', ')
}

// Same precedence as the per-person card: a section's own principal / address beat the school-wide
// "Card Design" values, which in turn beat the school's own.
const schoolInfo = computed(() => {
  const sec = activeSection.value
  const sectionAddress = addressLine(sec?.address)
  return {
    name: uiSettings.schoolName || school.value?.name || 'Your School',
    logo: sec?.logo || school.value?.logo || '/icon.svg',
    principal: sec?.principalName || uiSettings.principalName || school.value?.principalName || '',
    signature: sec?.principalSignature || fullSchool.value?.principalSignature || '',
    phone: sec?.phone || fullSchool.value?.phone || '',
    address: sectionAddress || uiSettings.schoolAddress || '',
    tagline: school.value?.motto || fullSchool.value?.motto || ''
  }
})

const mockTemplate = computed(() => {
  if (cardType.value === 'staff') {
    return {
      id: 'preview',
      name: `${mockStaff.givenNames} ${mockStaff.familyName}`,
      type: 'Staff ID Card',
      level: mockStaff.designation,
      createdBy: 'System',
      updatedAt: '',
      cardsIssued: 0,
      validityYears: uiSettings.validityYears || 1,
      accentColor: uiSettings.headerColor,
      accentColorDark: uiSettings.headerColor,
      school: schoolInfo.value,
      staff: {
        name: `${mockStaff.givenNames} ${mockStaff.familyName}`,
        staffId: mockStaff.staffId,
        designation: mockStaff.designation,
        gender: mockStaff.gender,
        expiryDate: formatDate(previewValidUntil.value),
        phone: mockStaff.phone,
        photo: mockStaff.photo
      }
    }
  }

  return {
    id: 'preview',
    name: `${mockStudent.givenNames} ${mockStudent.familyName}`,
    type: 'Student ID Card',
    level: mockStudent.className,
    createdBy: 'System',
    updatedAt: '',
    cardsIssued: 0,
    validityYears: uiSettings.validityYears || 1,
    accentColor: uiSettings.headerColor,
    accentColorDark: uiSettings.headerColor,
    school: schoolInfo.value,
    student: {
      name: `${mockStudent.givenNames} ${mockStudent.familyName}`,
      admissionNo: mockStudent.admissionNumber,
      class: mockStudent.className,
      gender: mockStudent.gender,
      dob: formatDate(mockStudent.dateOfBirth),
      expiryDate: formatDate(previewValidUntil.value),
      emergencyContact: mockStudent.guardianPhone,
      parentContact: mockStudent.guardianPhone,
      photo: mockStudent.photo
    }
  }
})

onMounted(async () => {
  useAppStore().setTitle('ID Card Settings')
  hydrateFromCache()
  loadStructure().catch(() => {})
  loadMyScope().catch(() => {})
  SchoolApi().get('current').then((res) => { fullSchool.value = res }).catch(() => {})
  await store.fetch()
  Object.assign(uiSettings, store.settings)
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>
