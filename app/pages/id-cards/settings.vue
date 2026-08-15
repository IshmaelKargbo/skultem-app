<template>
  <div class="space-y-6 mt-6 p-4 md:px-6">
    <Heading title="ID Card Settings" subtitle="Configure default ID card templates and presets." />

    <IDCardSettings v-model="open" :settings="settings" :active-fields="activeFields" :default-settings="defaultSettings"
      @update:settings="updateSettings" @update:active-fields="updateFields" @save="saveSettings" @close="onClose" />

  </div>
</template>

<script setup lang="ts">
import IDCardSettings from '../../components/id-cards/IDCardSettings.vue'
import IDCardPreview from '../../components/id-cards/IDCardPreview.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const { success } = useNotify()

const open = ref(true)

const defaultSettings = {
  audience: 'student',
  layout: 'vertical',
  profileShape: 'square',
  preset: 'modern',
  headerColor: '#2563eb',
  footerColor: '#2563eb',
  headerTextColor: '#ffffff',
  primaryTextColor: '#111827',
  widthMm: 85,
  heightMm: 54,
  bgImageUrl: '',
  bgOpacity: 20
}

const settings = reactive({ ...defaultSettings })

const studentFields = reactive([
  { key: 'name', label: 'Full Name', icon: 'i-lucide-user', cardSlot: 'front', enabled: true, required: true },
  { key: 'admissionNo', label: 'Admission No.', icon: 'i-lucide-id-card', cardSlot: 'front', enabled: true, required: true },
  { key: 'class', label: 'Class', icon: 'i-lucide-school', cardSlot: 'front', enabled: true },
  { key: 'gender', label: 'Gender', icon: 'i-lucide-user-round', cardSlot: 'front', enabled: true },
  { key: 'dob', label: 'Date of Birth', icon: 'i-lucide-calendar-days', cardSlot: 'front', enabled: true },
  { key: 'expiryDate', label: 'Valid Until', icon: 'i-lucide-calendar-check', cardSlot: 'front', enabled: true },
  { key: 'parentContact', label: 'Parent Contact', icon: 'i-lucide-phone', cardSlot: 'back', enabled: true },
  { key: 'emergencyContact', label: 'Emergency Contact', icon: 'i-lucide-phone-call', cardSlot: 'back', enabled: true }
])

const activeFields = computed(() => studentFields)

// small preview template driven by settings.preset and settings
const presets = {
  modern: {
    name: 'Modern Blue Template',
    accentColor: '#2563eb',
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

const previewTemplate = reactive({
  id: 'preview',
  name: presets[settings.preset].name,
  type: 'Student ID Card',
  level: 'Secondary School',
  createdBy: 'System',
  updatedAt: new Date().toLocaleDateString(),
  cardsIssued: 0,
  validityYears: 1,
  accentColor: presets[settings.preset].accentColor,
  accentColorDark: presets[settings.preset].accentColor,
  school: { ...presets[settings.preset].school },
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

watch(() => settings.preset, (val) => {
  const p = presets[val] || presets.modern
  previewTemplate.name = p.name
  previewTemplate.accentColor = p.accentColor
  previewTemplate.accentColorDark = p.accentColor
  previewTemplate.school = { ...p.school }
})

function updateSettings(newSettings) {
  Object.assign(settings, newSettings)
}

function updateFields(newFields) {
  studentFields.splice(0, studentFields.length, ...newFields)
}

function saveSettings() {
  localStorage.setItem('idcard:settings', JSON.stringify(settings))
  success('Settings saved')
  router.back()
}

function onClose() {
  router.back()
}
</script>
