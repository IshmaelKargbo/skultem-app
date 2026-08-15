<template>
  <div class="space-y-6 mt-6 p-4 md:px-6">

    <!-- Header Section -->
    <Heading :title="template.name" subtitle="Preview how ID cards generated with this template will appear.">
      <UBadge color="success" variant="subtle">
        Default
      </UBadge>

      <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" to="/id-cards/templates" class="justify-center">
        Back
      </UButton>

      <!-- <div class="flex items-center gap-2">
        <USelect :items="templateOptions" v-model="settings.preset" class="w-48" />
        <UButton size="sm" :variant="settings.layout === 'vertical' ? 'solid' : 'outline'" @click="settings.layout = 'vertical'">Vertical</UButton>
        <UButton size="sm" :variant="settings.layout === 'horizontal' ? 'solid' : 'outline'" @click="settings.layout = 'horizontal'">Horizontal</UButton>
        <UButton size="sm" :variant="settings.profileShape === 'round' ? 'solid' : 'outline'" @click="settings.profileShape = 'round'">Round</UButton>
        <UButton size="sm" :variant="settings.profileShape === 'square' ? 'solid' : 'outline'" @click="settings.profileShape = 'square'">Square</UButton>
      </div> -->

      <UButton icon="i-lucide-settings-2" variant="outline" color="neutral" to="/id-cards/settings" class="justify-center">
        Settings
      </UButton>

      <UButton icon="i-lucide-download" variant="outline" color="neutral" :loading="downloading" class="justify-center" @click="downloadPdf">
        Download PDF
      </UButton>
      <UButton icon="i-lucide-printer" variant="outline" color="neutral" class="justify-center" @click="printCard">
        Print
      </UButton>
    </Heading>

    <!-- Quick Stats -->
    <div class="grid gap-4 sm:grid-cols-3">

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <UIcon name="i-lucide-users" class="size-6 text-primary" />
          </div>
          <div>
            <p class="text-2xl font-bold leading-tight">{{ template.cardsIssued }}</p>
            <p class="text-sm text-muted">Cards issued</p>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
            <UIcon name="i-lucide-school" class="size-6 text-blue-500" />
          </div>
          <div>
            <p class="text-2xl font-bold leading-tight">{{ template.level }}</p>
            <p class="text-sm text-muted">Applies to</p>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
            <UIcon name="i-lucide-calendar-clock" class="size-6 text-orange-500" />
          </div>
          <div>
            <p class="text-2xl font-bold leading-tight">{{ template.validityYears }}yr</p>
            <p class="text-sm text-muted">Validity period</p>
          </div>
        </div>
      </UCard>

    </div>
    <!-- Main Content Grid -->
    <div class="grid gap-6 lg:grid-cols-3">

      <!-- Template Info Sidebar -->
      <div class="space-y-6 lg:sticky lg:top-6 lg:self-start">

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-info" class="size-5 text-primary" />
              <h3 class="font-semibold">Template Details</h3>
            </div>
          </template>
          <dl class="divide-y divide-default">
            <div class="flex items-center justify-between py-2.5">
              <dt class="text-sm text-muted">Type</dt>
              <dd class="text-sm font-medium">{{ template.type }}</dd>
            </div>
            <div class="flex items-center justify-between py-2.5">
              <dt class="text-sm text-muted">School Level</dt>
              <dd class="text-sm font-medium">{{ template.level }}</dd>
            </div>
            <div class="flex items-center justify-between py-2.5">
              <dt class="text-sm text-muted">Created By</dt>
              <dd class="text-sm font-medium">{{ template.createdBy }}</dd>
            </div>
            <div class="flex items-center justify-between py-2.5">
              <dt class="text-sm text-muted">Updated</dt>
              <dd class="text-sm font-medium">{{ template.updatedAt }}</dd>
            </div>
          </dl>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-palette" class="size-5 text-primary" />
              <h3 class="font-semibold">Theme</h3>
            </div>
          </template>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="size-9 shrink-0 rounded-lg border border-default"
                :style="{ backgroundColor: template.accentColor }" />
              <div>
                <p class="text-sm font-medium">Accent Color</p>
                <p class="font-mono text-xs text-muted">{{ template.accentColor }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 pt-1">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-default">
                <UIcon name="i-lucide-shield-check" class="size-4 text-muted" />
              </div>
              <div>
                <p class="text-sm font-medium">Security Features</p>
                <p class="text-xs text-muted">Watermark, barcode, hologram strip</p>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Settings + Preview Section -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Card Preview (Separate Component) -->
        <IDCardPreview :template="template" :settings="settings" :active-fields="activeFields" />

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import IDCardPreview from '../../components/id-cards/IDCardPreview.vue'

const route = useRoute()
const appStore = useAppStore()
const { success } = useNotify()

const templateId = computed(() => route.params.id)
const downloading = ref(false)

// Template data
const template = ref({
  id: templateId.value,
  name: 'Modern Blue Template',
  type: 'Student ID Card',
  level: 'Secondary School',
  createdBy: 'Administrator',
  updatedAt: 'Jun 17, 2026',
  cardsIssued: 482,
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
    name: 'John Kamara',
    admissionNo: 'KWIS001',
    class: 'JSS1-A',
    gender: 'Male',
    dob: '12 Mar 2011',
    expiryDate: 'Jun 30, 2027',
    emergencyContact: '+232 76 123 456',
    parentContact: '+232 76 123 456',
  }
})

// Settings state
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
  bgOpacity: 20,
}

const settings = reactive({ ...defaultSettings })

// Template presets
const presets: Record<string, any> = {
  modern: {
    name: 'Modern Blue Template',
    accentColor: '#2563eb',
    accentColorDark: '#1e3a8a',
    headerColor: '#2563eb',
    footerColor: '#2563eb',
    headerTextColor: '#ffffff',
    primaryTextColor: '#111827',
    school: {
      name: "KING'S WAY INTERNATIONAL SCHOOL",
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg',
      principal: 'Dr. A. Conteh',
      address: '12 Wilkinson Road, Freetown, Sierra Leone'
    }
  },
  classic: {
    name: 'Classic Green Template',
    accentColor: '#10b981',
    accentColorDark: '#065f46',
    headerColor: '#10b981',
    footerColor: '#10b981',
    headerTextColor: '#ffffff',
    primaryTextColor: '#0f172a',
    school: {
      name: "KING'S WAY CLASSIC SCHOOL",
      logo: 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png',
      principal: 'Mrs. J. Doe',
      address: '88 Classic Ave, Freetown'
    }
  }
}

// options for select
const templateOptions = [
  { label: 'Modern Blue', value: 'modern' },
  { label: 'Classic Green', value: 'classic' }
]


// Field definitions
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
  { key: 'emergencyContact', label: 'Emergency Contact', icon: 'i-lucide-phone-call', cardSlot: 'back', enabled: true },
])

const staffFields = reactive<FieldDef[]>([
  { key: 'name', label: 'Full Name', icon: 'i-lucide-user', cardSlot: 'front', enabled: true, required: true },
  { key: 'staffId', label: 'Staff ID', icon: 'i-lucide-id-card', cardSlot: 'front', enabled: true, required: true },
  { key: 'role', label: 'Role', icon: 'i-lucide-briefcase', cardSlot: 'front', enabled: true },
  { key: 'department', label: 'Department', icon: 'i-lucide-building-2', cardSlot: 'front', enabled: true },
  { key: 'gender', label: 'Gender', icon: 'i-lucide-user-round', cardSlot: 'front', enabled: false },
  { key: 'expiryDate', label: 'Valid Until', icon: 'i-lucide-calendar-check', cardSlot: 'front', enabled: true },
  { key: 'email', label: 'Email', icon: 'i-lucide-mail', cardSlot: 'back', enabled: true },
  { key: 'phone', label: 'Phone', icon: 'i-lucide-phone', cardSlot: 'back', enabled: true },
])

const activeFields = computed(() =>
  settings.audience === 'student' ? studentFields : staffFields
)

// Event handlers
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
  // TODO: persist via API
  success('Settings saved')
  settingsOpen.value = false
}

function printCard() {
  window.print()
}

async function downloadPdf() {
  try {
    downloading.value = true
    await new Promise(resolve => setTimeout(resolve, 600))
    success('ID card downloaded')
  } finally {
    downloading.value = false
  }
}

onMounted(() => {
  appStore.setTitle(`${template.value.name} Preview`)
  try {
    const saved = localStorage.getItem('idcard:settings')
    if (saved) {
      const s = JSON.parse(saved)
      Object.assign(settings, s)
      if (s.preset && presets[s.preset]) {
        const p = presets[s.preset]
        template.value.name = p.name
        template.value.accentColor = p.accentColor
        template.value.accentColorDark = p.accentColorDark
        template.value.school = { ...template.value.school, ...p.school }
        template.value.headerColor = p.headerColor
        template.value.footerColor = p.footerColor
        template.value.headerTextColor = p.headerTextColor
        template.value.primaryTextColor = p.primaryTextColor
      }
    } else {
      const p = presets[settings.preset] || presets.modern
      template.value.name = p.name
      template.value.accentColor = p.accentColor
      template.value.accentColorDark = p.accentColorDark
      template.value.school = { ...template.value.school, ...p.school }
      template.value.headerColor = p.headerColor
      template.value.footerColor = p.footerColor
      template.value.headerTextColor = p.headerTextColor
      template.value.primaryTextColor = p.primaryTextColor
    }
  } catch (e) {
    // ignore
  }
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
