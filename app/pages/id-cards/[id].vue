<template>
  <div class="space-y-4 px-4 md:px-6">
    <Heading :title="personName || 'ID Card Preview'"
      :subtitle="`Preview and print this ${cardType}'s identification card.`">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
        <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" to="/id-cards" class="justify-center">
          Back
        </UButton>

        <UButton icon="i-lucide-settings-2" variant="outline" color="neutral" to="/id-cards/settings"
          class="justify-center">
          Card Design
        </UButton>

        <UButton icon="i-lucide-download" variant="outline" color="neutral" :loading="downloading"
          class="justify-center" @click="downloadPdf">
          Download PDF
        </UButton>

        <UButton icon="i-lucide-printer" variant="outline" color="neutral" :loading="printing" class="justify-center"
          @click="printCard">
          Print
        </UButton>
      </div>
    </Heading>

    <div v-if="loading" class="flex justify-center py-20">
      <USkeleton class="h-80 w-full max-w-[420px] rounded-[28px]" />
    </div>

    <IdCardsIDCardPreview v-else-if="template" v-model:side="side" :template="template" :is-pdf-capture="isPdfCapture"
      :settings="idCardStore.settings" :active-fields="activeFields" :card-type="cardType" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const isPdfCapture = ref(false)
const idCardStore = useIdCardStore()
const { success, error: toastError } = useNotify()

const recordId = computed(() => String(route.params.id))
// /id-cards/[id]?type=staff selects a teacher record instead of a student one - everything else
// (design settings, preview component, PDF/print export) is shared between the two.
const cardType = computed<'student' | 'staff'>(() => (route.query.type === 'staff' ? 'staff' : 'student'))
const activeFields = computed(() => (cardType.value === 'staff' ? idCardStore.staffFields : idCardStore.fields))

const student = ref<Student>()
const teacher = ref<Teacher>()
const school = ref<any>()
const brandingAssets = ref<{ logo: string | null, principalSignature: string | null }>()
// Same lazy same-origin swap as brandingAssets above, for the student/staff photo - see
// captureBothSides(). Keyed by the raw photo URL so switching between two people (or a person
// whose photo changes) doesn't keep serving a stale data: URI from a previous capture.
const photoDataUri = ref<{ url: string, dataUri: string }>()
const loading = ref(true)
const downloading = ref(false)
const printing = ref(false)
const side = ref<'front' | 'back'>('front')

const personName = computed(() => {
  if (cardType.value === 'staff') return teacher.value ? `${teacher.value.user.givenNames} ${teacher.value.user.familyName}` : ''
  return student.value ? `${student.value.givenNames} ${student.value.familyName}` : ''
})

// Issued "today", expiring after however many years the school's card design
// settings say a card stays valid for (default 1) - not persisted anywhere,
// just computed fresh each time the card is viewed/downloaded.
const validUntil = computed(() => {
  const years = idCardStore.settings.validityYears || 1
  const date = new Date()
  date.setFullYear(date.getFullYear() + years)
  return date.toISOString()
})

// Plain R2 URL either way, regardless of card type - resolvedPhoto below swaps it for the
// data: URI once captureBothSides() has fetched one for this exact URL.
const rawPhotoUrl = computed(() => {
  if (cardType.value === 'staff') return teacher.value?.user.photo || ''
  return student.value?.photo || ''
})

const resolvedPhoto = computed(() => {
  if (photoDataUri.value && photoDataUri.value.url === rawPhotoUrl.value) return photoDataUri.value.dataUri
  return rawPhotoUrl.value
})

const template = computed(() => {
  const schoolInfo = {
    name: idCardStore.settings.schoolName || 'School',
    // Plain R2 URL for on-screen display (fast, no extra round trip) - the
    // CORS-safe data: URI from getBrandingAssets() is only fetched lazily,
    // right before a PDF/print capture that actually needs it (see
    // captureBothSides), so it never blocks the initial page load.
    logo: brandingAssets.value?.logo || school.value?.logo || '/icon.svg',
    principal: idCardStore.settings.principalName || school.value?.principalName || '',
    signature: brandingAssets.value?.principalSignature || school.value?.principalSignature || '',
    address: idCardStore.settings.schoolAddress || ''
  }

  if (cardType.value === 'staff') {
    if (!teacher.value) return undefined
    const t = teacher.value

    return {
      id: t.id,
      name: `${t.user.givenNames} ${t.user.familyName}`,
      type: 'Staff ID Card',
      level: t.designation || '',
      createdBy: 'System',
      updatedAt: '',
      cardsIssued: 0,
      validityYears: idCardStore.settings.validityYears || 1,
      accentColor: idCardStore.settings.headerColor,
      accentColorDark: idCardStore.settings.headerColor,
      school: schoolInfo,
      staff: {
        name: `${t.user.givenNames} ${t.user.familyName}`,
        staffId: t.staffId,
        designation: t.designation || '',
        gender: t.gender,
        expiryDate: formatDate(validUntil.value),
        phone: t.phone || '',
        photo: resolvedPhoto.value
      }
    }
  }

  if (!student.value) return undefined
  const s = student.value

  return {
    id: s.id,
    name: `${s.givenNames} ${s.familyName}`,
    type: 'Student ID Card',
    level: s.className,
    createdBy: 'System',
    updatedAt: '',
    cardsIssued: 0,
    validityYears: idCardStore.settings.validityYears || 1,
    accentColor: idCardStore.settings.headerColor,
    accentColorDark: idCardStore.settings.headerColor,
    school: schoolInfo,
    student: {
      name: `${s.givenNames} ${s.familyName}`,
      admissionNo: s.admissionNumber,
      class: s.className,
      gender: s.gender,
      dob: s.dateOfBirth ? formatDate(s.dateOfBirth) : '',
      expiryDate: formatDate(validUntil.value),
      emergencyContact: s.guardian?.phone || '',
      parentContact: s.guardian?.phone || '',
      photo: resolvedPhoto.value
    }
  }
})

async function captureBothSides(): Promise<HTMLCanvasElement[]> {
  try {
    const original = side.value
    const canvases: HTMLCanvasElement[] = []
    isPdfCapture.value = true

    // Fetch once, lazily, right before the capture that needs it - not on
    // page load, so viewing the card stays fast. Cached in the ref so a
    // second download/print in the same visit doesn't re-fetch.
    if (!brandingAssets.value) {
      brandingAssets.value = await SchoolApi().getBrandingAssets()
      await nextTick()
    }

    if (rawPhotoUrl.value && (!photoDataUri.value || photoDataUri.value.url !== rawPhotoUrl.value)) {
      const dataUri = await SchoolApi().getAssetDataUri(rawPhotoUrl.value)
      if (dataUri) photoDataUri.value = { url: rawPhotoUrl.value, dataUri }
      await nextTick()
    }

    if (document.fonts?.ready) {
      await document.fonts.ready
    }

    for (const face of ['front', 'back'] as const) {
      side.value = face

      await nextTick()

      await new Promise(resolve =>
        requestAnimationFrame(() => resolve(null))
      )

      await new Promise(resolve => setTimeout(resolve, 100))

      const el = document.querySelector(
        '.id-card-face'
      ) as HTMLElement | null

      if (!el) {
        throw new Error(`Unable to find ${face} ID card`)
      }

      canvases.push(await captureCardFace(el))
    }

    side.value = original
    await nextTick()

    return canvases
  } finally {
    isPdfCapture.value = false
  }
}

async function downloadPdf() {
  downloading.value = true
  try {
    const canvases = await captureBothSides()
    await downloadCardsFromCanvases(canvases, idCardStore.settings.widthMm, idCardStore.settings.heightMm, personName.value || 'id-card')
    success('ID card downloaded')
  } catch (err: any) {
    toastError(err?.message || 'Failed to generate PDF')
  } finally {
    downloading.value = false
  }
}

async function printCard() {
  printing.value = true
  try {
    const canvases = await captureBothSides()
    await printCardsFromCanvases(canvases, idCardStore.settings.widthMm, idCardStore.settings.heightMm, personName.value || 'id-card')
  } catch (err: any) {
    toastError(err?.message || 'Failed to prepare card for printing')
  } finally {
    printing.value = false
  }
}

onMounted(async () => {
  useAppStore().setTitle('ID Card Preview')
  loading.value = true
  try {
    if (cardType.value === 'staff') {
      const [teacherRes, schoolRes] = await Promise.all([
        TeacherApi().getOne(recordId.value),
        SchoolApi().get('current'),
        idCardStore.fetch()
      ])
      teacher.value = teacherRes
      school.value = schoolRes
    } else {
      const [studentRes, schoolRes] = await Promise.all([
        StudentApi().getStudent(recordId.value),
        SchoolApi().get('current'),
        idCardStore.fetch()
      ])
      student.value = studentRes
      school.value = schoolRes
    }
  } finally {
    loading.value = false
  }
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
