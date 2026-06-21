<template>
  <div class="space-y-6 mt-6">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <div class="flex items-center gap-3">

          <h1 class="text-2xl font-bold tracking-tight">
            {{ template.name }}
          </h1>

          <UBadge color="success" variant="subtle">
            Default
          </UBadge>

        </div>

        <p class="mt-1 text-sm text-muted">
          Preview how ID cards generated with this template will appear.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">

        <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" to="/id-cards/templates">
          Back
        </UButton>

        <UButton icon="i-lucide-pencil-line" color="primary" :to="`/documents/id-cards/templates/${template.id}/edit`">
          Edit Template
        </UButton>

        <UButton icon="i-lucide-download" variant="outline" color="neutral" :loading="downloading" @click="downloadPdf">
          Download PDF
        </UButton>

        <UButton icon="i-lucide-printer" variant="outline" color="neutral" @click="printCard">
          Print
        </UButton>

      </div>

    </div>

    <!-- Quick stats -->
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

    <div class="grid gap-6 lg:grid-cols-3">

      <!-- Template Info -->
      <div class="space-y-6 lg:sticky lg:top-6 lg:self-start">

        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-info" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Template Details
              </h3>
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
              <h3 class="font-semibold">
                Theme
              </h3>
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

        <UCard>

          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-layers" class="size-5 text-primary" />
              <h3 class="font-semibold">
                Other Templates
              </h3>
            </div>
          </template>

          <div class="space-y-2">

            <NuxtLink v-for="related in relatedTemplates" :key="related.id"
              :to="`/documents/id-cards/templates/${related.id}`"
              class="flex items-center gap-3 rounded-xl border border-default p-3 transition-colors hover:bg-muted/40">
              <div class="size-8 shrink-0 rounded-lg" :style="{ backgroundColor: related.accentColor }" />
              <div class="min-w-0">
                <p class="truncate text-sm font-medium">{{ related.name }}</p>
                <p class="text-xs text-muted">{{ related.level }}</p>
              </div>
            </NuxtLink>

          </div>

        </UCard>

      </div>

      <!-- Preview -->
      <div class="lg:col-span-2 space-y-4">

        <UCard :ui="{ body: 'p-6 sm:p-10' }"
          class="bg-[radial-gradient(circle_at_top,_var(--ui-bg-muted)_0%,_transparent_70%)]">

          <!-- Front / Back toggle -->
          <div class="mb-6 flex justify-center">
            <UButtonGroup>
              <UButton :variant="side === 'front' ? 'solid' : 'outline'" color="neutral" size="sm"
                @click="side = 'front'">
                Front
              </UButton>
              <UButton :variant="side === 'back' ? 'solid' : 'outline'" color="neutral" size="sm"
                @click="side = 'back'">
                Back
              </UButton>
            </UButtonGroup>
          </div>

          <div class="flex justify-center">

            <!-- ID CARD: FRONT -->
            <div v-if="side === 'front'"
              class="relative w-full max-w-[420px] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_50px_-12px_rgb(0_0_0_/_0.25)] ring-1 ring-black/5">

              <!-- Top -->
              <div class="px-6 pb-4 pt-1 text-center text-xs font-semibold uppercase tracking-[0.25em]"
                :style="{ backgroundColor: template.accentColor }">

                <div class="flex flex-col items-center justify-center space-y-4 h-40">

                  <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/95 p-2 shadow-sm">
                    <img :src="template.school.logo" class="size-full object-contain" alt="School logo">
                  </div>

                  <div class="min-w-0">
                    <p class="text-center text-base font-semibold uppercase tracking-wide text-white">
                      {{ template.school.name }}
                    </p>
                    <p class="mt-0.5 text-xs font-medium uppercase text-center tracking-widest text-white/75">
                      Student ID Card
                    </p>

                  </div>

                </div>

              </div>

              <!-- Photo, overlapping the header -->
              <div class="relative -mt-6 flex justify-center">
                <div class="flex size-30 items-center justify-center rounded-2xl bg-gray-100 ring-4 ring-white">
                  <UIcon name="i-lucide-user" class="text-4xl  text-gray-400" />
                </div>
              </div>

              <!-- Body -->
              <div class="relative px-6 pb-6 pt-3 text-center">

                <h3 class="font-bold text-lg">
                  {{ template.student.name }}
                </h3>

                <p class=" text-sm font-semibold">
                  {{ template.student.class }}
                </p>


                <div class="mt-5 grid grid-cols-2 gap-3 text-left">

                  <!-- Gender -->
                  <div class="rounded-xl border border-default bg-gray-50 p-3">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-user-round" class="text-primary" />

                      <p class="text-[10px] uppercase tracking-wider text-muted">
                        Gender
                      </p>
                    </div>

                    <p class="mt-1 text-sm font-semibold">
                      {{ template.student.gender }}
                    </p>
                  </div>

                  <!-- Admission Number -->
                  <div class="rounded-xl border border-default bg-gray-50 p-3">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-id-card" class="text-primary" />

                      <p class="text-[10px] uppercase tracking-wider text-muted">
                        Admission No.
                      </p>
                    </div>

                    <p class="mt-1 text-sm font-semibold">
                      {{ template.student.admissionNo }}
                    </p>
                  </div>

                  <!-- Date of Birth -->
                  <div class="rounded-xl border border-default bg-gray-50 p-3">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-calendar-days" class="text-primary" />

                      <p class="text-[10px] uppercase tracking-wider text-muted">
                        Date of Birth
                      </p>
                    </div>

                    <p class="mt-1 text-sm font-semibold">
                      {{ template.student.dob }}
                    </p>
                  </div>

                  <!-- Valid Until -->
                  <div class="rounded-xl border border-default bg-gray-50 p-3">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-calendar-check" class="text-primary" />

                      <p class="text-[10px] uppercase tracking-wider text-muted">
                        Valid Until
                      </p>
                    </div>

                    <p class="mt-1 text-sm font-semibold">
                      {{ template.student.expiryDate }}
                    </p>
                  </div>

                </div>


              </div>

              <!-- Signature strip -->
              <div class="relative border-t border-dashed border-gray-200 px-6 py-3">
                <div class="flex items-center justify-between text-[10px] text-gray-400">
                  <span>Authorized Signature</span>
                  <span class="italic">{{ template.school.principal }}</span>
                </div>
              </div>

              <!-- Footer -->
              <div class="relative border-t border-gray-100 px-6 py-3 text-center text-[11px] text-white"
                :style="{ backgroundColor: template.accentColor }">
                If found, kindly return to {{ template.school.name }}
              </div>

            </div>

            <!-- ID CARD: BACK -->
            <div v-else
              class="relative w-full max-w-[420px] overflow-hidden rounded-[30px] bg-white shadow-[0_20px_50px_-12px_rgb(0_0_0_/_0.25)] ring-1 ring-black/5">

              <!-- Header -->
              <div class="px-6 py-4 text-center" :style="{ backgroundColor: template.accentColor }">
                <h3 class="text-sm font-bold uppercase  text-white tracking-[0.3em]">
                  Important Information
                </h3>
              </div>

              <!-- Notice -->
              <div class="px-6 pt-5">

                <div class="rounded-3xl bg-gray-50 p-5 ring-1 ring-gray-100">

                  <div class="flex justify-center">
                    <div class="flex size-12 items-center justify-center rounded-2xl"
                      :style="{ backgroundColor: template.accentColor + '15' }">
                      <UIcon name="i-lucide-shield-check" class="text-xl" :style="{ color: template.accentColor }" />
                    </div>
                  </div>

                  <p class="mt-4 text-center text-sm leading-7 text-gray-600">
                    This card remains the property of
                    <strong>{{ template.school.name }}</strong>.

                    Loss of this card should be reported immediately to the school administration.

                    Students are required to carry this card while on school premises.
                  </p>

                </div>

              </div>

              <!-- Contacts -->
              <div class="mt-5 grid grid-cols-2 gap-3 px-6">

                <div class="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-100">

                  <div class="flex items-center gap-2">

                    <UIcon name="i-lucide-phone" class="text-primary" />

                    <p class="text-[10px] uppercase tracking-wider text-muted">
                      Parent
                    </p>

                  </div>

                  <p class="mt-2 text-sm font-semibold">
                    {{ template.student.parentContact }}
                  </p>

                </div>


                <div class="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-100">

                  <div class="flex items-center gap-2">

                    <UIcon name="i-lucide-phone-call" class="text-primary" />

                    <p class="text-[10px] uppercase tracking-wider text-muted">
                      Emergency
                    </p>

                  </div>

                  <p class="mt-2 text-sm font-semibold">
                    {{ template.student.emergencyContact }}
                  </p>

                </div>

              </div>

              <!-- Address -->
              <div class="px-6 mt-4">

                <div class="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-100">

                  <div class="flex items-center gap-2">

                    <UIcon name="i-lucide-map-pin" class="text-primary" />

                    <p class="text-[10px] uppercase tracking-wider text-muted">
                      School Address
                    </p>

                  </div>

                  <p class="mt-2 text-sm font-semibold">
                    {{ template.school.address }}
                  </p>

                </div>

              </div>

              <!-- QR -->
              <div class="mt-6 flex justify-center">

                <div class="rounded-3xl bg-white p-4 shadow-lg ring-1 ring-gray-100">
                  <UIcon name="i-lucide-qr-code" class="text-6xl text-gray-700" />
                </div>

              </div>

              <!-- Footer -->
              <div class="mt-6 px-6 py-4 text-center text-xs text-white"
                :style="{ backgroundColor: template.accentColor }">
                <p class="font-medium">
                  Powered by Skultem School Management System
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
const route = useRoute()
const appStore = useAppStore()
const { success } = useNotify()

const templateId = computed(() => route.params.id)

const downloading = ref(false)
const side = ref<'front' | 'back'>('front')

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
    name: "KING'S WAy INTERNATIONAL SCHOOL",
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

const relatedTemplates = ref([
  { id: 2, name: 'Classic Maroon Template', level: 'Primary School', accentColor: '#9f1239' },
  { id: 3, name: 'Minimal Green Template', level: 'Senior Secondary', accentColor: '#15803d' }
])

const barcodePattern = computed(() =>
  Array.from({ length: 28 }, (_, i) => ({
    id: i,
    width: [2, 3, 1, 4][i % 4]
  }))
)

function printCard() {
  window.print()
}

async function downloadPdf() {
  try {
    downloading.value = true

    // TODO: Replace with actual PDF generation/export request
    await new Promise(resolve => setTimeout(resolve, 600))

    success('ID card downloaded')
  } finally {
    downloading.value = false
  }
}

onMounted(() => {
  appStore.setTitle(
    `${template.value.name} Preview`
  )
})

definePageMeta({
  role: [
    Role.ADMIN,
    Role.PROPRIETOR,
    Role.OWNER
  ]
})
</script>