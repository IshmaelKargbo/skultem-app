<template>
  <div class="space-y-4 px-4 md:px-6">
    <IdCardsSectionNav />

    <!-- Design (colours/layout/dimensions/background) is shared - only the field list below
         differs per card type, so one toggle up top drives both the field editor and the preview
         rather than duplicating it in each column. -->
    <div class="inline-flex overflow-hidden rounded-lg border border-default">
      <UButton :variant="cardType === 'student' ? 'solid' : 'outline'" color="neutral" size="sm" class="rounded-none"
        icon="i-lucide-graduation-cap" @click="cardType = 'student'">
        Student ID
      </UButton>
      <UButton :variant="cardType === 'staff' ? 'solid' : 'outline'" color="neutral" size="sm" class="rounded-none"
        icon="i-lucide-briefcase" @click="cardType = 'staff'">
        Staff ID
      </UButton>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Left: the settings form -->
      <div>
        <!-- Nuxt auto-imports this as IdCardsIDCardSettings (directory-prefixed) —
             use that name directly rather than an explicit import, which "remove
             unused import" tooling keeps stripping since it looks redundant. -->
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
// Do NOT add `import IDCardSettings from '.../IDCardSettings.vue'` here — see
// the template comment. Nuxt registers this component globally already; the
// bare `IDCardSettings` tag name just isn't it (see IdCardsIDCardSettings).
const router = useRouter()
const { success, error: toastError } = useNotify()
const store = useIdCardStore()
const { school, hydrateFromCache } = useSchoolInfo()

const open = ref(true)
// Which field list the "Fields" card edits and the preview renders - the design itself
// (uiSettings) is shared between student and staff cards, so it doesn't need its own per-type copy.
const cardType = ref<'student' | 'staff'>('student')
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

// Sample student - the design is school-wide, not any one student's, so the preview stands in
// with placeholder data (mirrors how pages/id-cards/[id].vue builds the real template, just with
// this fake person instead of a fetched one). Real school branding (logo/name/principal) still
// comes through so the preview shows the actual school, not a generic placeholder.
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

const schoolInfo = computed(() => ({
  name: uiSettings.schoolName || school.value?.name || 'Your School',
  logo: school.value?.logo || '/icon.svg',
  principal: uiSettings.principalName || school.value?.principalName || '',
  signature: '',
  address: uiSettings.schoolAddress || ''
}))

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
  await store.fetch()
  Object.assign(uiSettings, store.settings)
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
