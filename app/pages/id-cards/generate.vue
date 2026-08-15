<template>
  <div class="space-y-6 mt-6 p-4 md:px-6">

    <!-- Header -->
    <Heading title="Generate ID Cards" subtitle="Generate printable student and staff identification cards.">
      <UButton
        icon="i-lucide-arrow-left"
        variant="outline"
        to="/id-cards"
        class="justify-center"
      >
        Back
      </UButton>
    </Heading>

    <!-- Statistics -->
    <div class="grid gap-4 md:grid-cols-4">

      <UCard>
        <div class="space-y-1">
          <p class="text-xs text-muted">
            Students
          </p>

          <h2 class="text-2xl font-bold">
            1,250
          </h2>
        </div>
      </UCard>

      <UCard>
        <div class="space-y-1">
          <p class="text-xs text-muted">
            Teachers
          </p>

          <h2 class="text-2xl font-bold">
            65
          </h2>
        </div>
      </UCard>

      <UCard>
        <div class="space-y-1">
          <p class="text-xs text-muted">
            Staff
          </p>

          <h2 class="text-2xl font-bold">
            22
          </h2>
        </div>
      </UCard>

      <UCard>
        <div class="space-y-1">
          <p class="text-xs text-muted">
            Templates
          </p>

          <h2 class="text-2xl font-bold">
            4
          </h2>
        </div>
      </UCard>

    </div>

    <!-- Generator -->
    <UCard class="rounded-3xl">

      <template #header>
        <h2 class="font-semibold text-lg">
          Card Settings
        </h2>
      </template>

      <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

        <UFormField label="Card Type">
          <USelect
            v-model="form.type"
            :items="types"
          />
        </UFormField>

        <UFormField label="Academic Year">
          <USelect
            v-model="form.year"
            :items="years"
          />
        </UFormField>

        <UFormField label="Class">
          <USelect
            v-model="form.class"
            :items="classes"
          />
        </UFormField>

        <UFormField label="Section">
          <USelect
            v-model="form.section"
            :items="sections"
          />
        </UFormField>

        <UFormField label="Template">
          <USelect
            v-model="form.template"
            :items="templates"
          />
        </UFormField>

        <UFormField label="Expiry Date">
          <UInput
            v-model="form.expiryDate"
            type="date"
          />
        </UFormField>

      </div>

    </UCard>

    <!-- Options -->
    <UCard>

      <template #header>
        <h2 class="font-semibold">
          Card Options
        </h2>
      </template>

      <div class="space-y-5">

        <UCheckbox
          v-model="form.includeQr"
          label="Include QR Code"
        />

        <UCheckbox
          v-model="form.includeBarcode"
          label="Include Barcode"
        />

        <UCheckbox
          v-model="form.includeSignature"
          label="Include Principal Signature"
        />

        <UCheckbox
          v-model="form.includeExpiry"
          label="Show Expiry Date"
        />

      </div>

    </UCard>

    <!-- Preview -->
    <UCard>

      <template #header>
        <h2 class="font-semibold">
          Summary
        </h2>
      </template>

      <div class="grid gap-4 md:grid-cols-3">

        <div class="rounded-2xl bg-primary/5 p-5">
          <p class="text-sm text-muted">
            Card Type
          </p>

          <h3 class="font-bold mt-2">
            {{ form.type }}
          </h3>
        </div>

        <div class="rounded-2xl bg-primary/5 p-5">
          <p class="text-sm text-muted">
            Template
          </p>

          <h3 class="font-bold mt-2">
            {{ form.template }}
          </h3>
        </div>

        <div class="rounded-2xl bg-primary/5 p-5">
          <p class="text-sm text-muted">
            Cards To Generate
          </p>

          <h3 class="font-bold mt-2">
            45
          </h3>
        </div>

      </div>

    </UCard>

    <!-- Actions -->
    <div class="flex flex-wrap gap-3">

      <UButton
        icon="i-lucide-id-card"
        color="primary"
        size="lg"
        @click="generateCards"
      >
        Generate Cards
      </UButton>

      <UButton
        icon="i-lucide-eye"
        variant="outline"
        @click="previewOpen = !previewOpen"
      >
        Preview
      </UButton>

      <UButton
        icon="i-lucide-settings-2"
        variant="outline"
        @click="settingsOpen = !settingsOpen"
      >
        Settings
      </UButton>

      <UButton
        icon="i-lucide-download"
        variant="outline"
        @click="downloadPdf"
      >
        Download PDF
      </UButton>

      <UButton
        icon="i-lucide-printer"
        variant="outline"
        @click="printCards"
      >
        Print
      </UButton>

    </div>

    <!-- Settings panel and preview -->
    <IDCardSettings v-model="settingsOpen" :settings="settings" :active-fields="activeFields" :default-settings="defaultSettings" @update:settings="updateSettings" @update:active-fields="updateFields" @save="saveSettings" @close="settingsOpen = false" />

    <div v-if="previewOpen" class="mt-4">
      <IDCardPreview :template="sampleTemplate" :settings="settings" :active-fields="activeFields" />
    </div>

  </div>
</template>

<script setup lang="ts">
const { info, success } = useNotify()

const form = reactive({
  type: 'Student',
  year: '2025/2026',
  class: 'JSS1',
  section: 'A',
  template: 'Standard Template',
  expiryDate: '',

  includeQr: true,
  includeBarcode: true,
  includeSignature: true,
  includeExpiry: true
})

const types = [
  'Student',
  'Teacher',
  'Staff'
]

const years = [
  '2025/2026',
  '2026/2027'
]

const classes = [
  'JSS1',
  'JSS2',
  'JSS3',
  'SSS1',
  'SSS2',
  'SSS3'
]

const sections = [
  'A',
  'B',
  'C'
]

const templates = [
  'Standard Template',
  'Modern Blue',
  'Classic Green',
  'International'
]

// Preview + settings panel state
const previewOpen = ref(false)
const settingsOpen = ref(false)

const defaultSettings = {
  audience: 'student' as 'student' | 'staff',
  layout: 'vertical' as 'vertical' | 'horizontal',
  profileShape: 'square' as 'round' | 'square',
  preset: 'modern',
  headerColor: '#2563eb',
  footerColor: '#2563eb',
  headerTextColor: '#ffffff',
  primaryTextColor: '#111827',
  widthMm: 85,
  heightMm: 54,
  bgImageUrl: '' as string,
  bgOpacity: 20
}

const settings = reactive({ ...defaultSettings })

interface FieldDef {
  key: string
  label: string
  icon: string
  cardSlot: 'front' | 'back'
  enabled: boolean
  required?: boolean
}

const studentFields = reactive<FieldDef[]>([
  { key: 'name', label: 'Full Name', icon: 'i-lucide-user', cardSlot: 'front', enabled: true, required: true },
  { key: 'admissionNo', label: 'Admission No.', icon: 'i-lucide-id-card', cardSlot: 'front', enabled: true, required: true },
  { key: 'class', label: 'Class', icon: 'i-lucide-school', cardSlot: 'front', enabled: true },
  { key: 'gender', label: 'Gender', icon: 'i-lucide-user-round', cardSlot: 'front', enabled: true },
  { key: 'dob', label: 'Date of Birth', icon: 'i-lucide-calendar-days', cardSlot: 'front', enabled: true },
  { key: 'expiryDate', label: 'Valid Until', icon: 'i-lucide-calendar-check', cardSlot: 'front', enabled: true },
  { key: 'parentContact', label: 'Parent Contact', icon: 'i-lucide-phone', cardSlot: 'back', enabled: true },
  { key: 'emergencyContact', label: 'Emergency Contact', icon: 'i-lucide-phone-call', cardSlot: 'back', enabled: true }
])

const staffFields = reactive<FieldDef[]>([
  { key: 'name', label: 'Full Name', icon: 'i-lucide-user', cardSlot: 'front', enabled: true, required: true },
  { key: 'staffId', label: 'Staff ID', icon: 'i-lucide-id-card', cardSlot: 'front', enabled: true, required: true },
  { key: 'role', label: 'Role', icon: 'i-lucide-briefcase', cardSlot: 'front', enabled: true },
  { key: 'department', label: 'Department', icon: 'i-lucide-building-2', cardSlot: 'front', enabled: true },
  { key: 'gender', label: 'Gender', icon: 'i-lucide-user-round', cardSlot: 'front', enabled: false },
  { key: 'expiryDate', label: 'Valid Until', icon: 'i-lucide-calendar-check', cardSlot: 'front', enabled: true },
  { key: 'email', label: 'Email', icon: 'i-lucide-mail', cardSlot: 'back', enabled: true },
  { key: 'phone', label: 'Phone', icon: 'i-lucide-phone', cardSlot: 'back', enabled: true }
])

const activeFields = computed(() =>
  settings.audience === 'student' ? studentFields : staffFields
)

// Sample template used only to power the in-page live preview panel
const sampleTemplate = reactive({
  id: 'sample',
  name: 'Standard Template',
  type: 'Student ID Card',
  level: 'Secondary School',
  createdBy: 'Administrator',
  updatedAt: 'Jun 17, 2026',
  cardsIssued: 0,
  validityYears: 1,
  accentColor: '#2563eb',
  accentColorDark: '#1e3a8a',
  school: {
    name: "KING'S WAY INTERNATIONAL SCHOOL",
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg',
    principal: 'Dr. A. Conteh',
    address: '12 Wilkinson Road, Freetown, Sierra Leone'
  },
  student: {
    name: 'Sample Student',
    admissionNo: 'PREVIEW001',
    class: 'JSS1-A',
    gender: 'Male',
    dob: '01 Jan 2010',
    expiryDate: '2027-06-30',
    emergencyContact: '+232 76 000 000',
    parentContact: '+232 76 000 000'
  }
})

function updateSettings(newSettings: typeof settings) {
  Object.assign(settings, newSettings)
}

function updateFields(newFields: FieldDef[]) {
  if (settings.audience === 'student') {
    studentFields.splice(0, studentFields.length, ...newFields)
  } else {
    staffFields.splice(0, staffFields.length, ...newFields)
  }
}

function saveSettings() {
  success('Settings saved')
  settingsOpen.value = false
}

function generateCards() {
  info('Generating ID cards is not available yet.')
}

function downloadPdf() {
  info('Bulk PDF export is not available yet.')
}

function printCards() {
  info('Printing all ID cards is not available yet.')
}

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER
  ]
})
</script>