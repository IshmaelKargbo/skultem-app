<template>
  <UCard :ui="{ body: 'p-6 sm:p-10' }"
    class="bg-[radial-gradient(circle_at_top,_var(--ui-bg-muted)_0%,_transparent_70%)]">

    <!-- Front / Back toggle -->
    <div class="mb-6 flex justify-center">
      <div class="inline-flex overflow-hidden rounded-lg border border-default">
        <UButton :variant="side === 'front' ? 'solid' : 'outline'" color="neutral" size="sm" class="rounded-none"
          @click="side = 'front'">
          Front
        </UButton>
        <UButton :variant="side === 'back' ? 'solid' : 'outline'" color="neutral" size="sm" class="rounded-none"
          @click="side = 'back'">
          Back
        </UButton>
      </div>
    </div>
    <div class="flex justify-center overflow-auto">

      <!-- ═════════════════════════════════════════════════════════════ -->
      <!-- ID CARD: FRONT -->
      <!-- ═════════════════════════════════════════════════════════════ -->
      <div v-if="side === 'front'" class="id-card-face" :class="[
        'relative w-full overflow-hidden bg-white shadow-[0_20px_50px_-12px_rgb(0_0_0_/_0.25)] ring-1 ring-black/5 rounded-[20px]',
        settings.layout === 'vertical' ? 'max-w-[340px]' : 'max-w-[560px]',
        isPdfCapture && 'pdf-capture'
      ]">

        <!-- Background image layer -->
        <div v-if="settings.bgImageUrl" class="pointer-events-none absolute inset-0 z-0" :style="{
          backgroundImage: `url(${settings.bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: settings.bgOpacity / 100
        }" />

        <!-- ═════════ HEADER, WITH CURVED DIVIDER ═════════ -->
        <div class="relative overflow-hidden px-5 pb-12 pt-5 z-50" :style="{ backgroundColor: settings.headerColor }">
          <div class="pointer-events-none absolute inset-0 opacity-[0.12]"
            :style="{ background: `linear-gradient(115deg, transparent 40%, ${settings.headerTextColor} 40%, ${settings.headerTextColor} 46%, transparent 46%)` }" />

          <div class="relative flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-lg font-black uppercase leading-tight tracking-wide"
                :style="{ color: settings.headerTextColor }">
                {{
                  template.school.name
                }}
              </p>
              <p class="mt-1.5 text-[10px] font-medium uppercase tracking-[0.2em]"
                :style="{ color: settings.headerTextColor, opacity: 0.8 }">
                {{
                  template.school.tagline || 'Student Identification'
                }}
              </p>
            </div>

          </div>

          <div class="absolute -bottom-10 left-1/2 h-16 w-[135%] -translate-x-1/2 rounded-[50%] bg-white" />
        </div>

        <div v-if="settings.layout !== 'vertical'" class="absolute z-50 top-5 right-5 bg-white pt-1.5 items-center rounded-full"
          :style="{ '--tw-ring-color': settings.headerTextColor + '30' }">
          <img :src="template.school.logo" class="w-35 h-37 rounded-full object-fill" alt="School crest">
        </div>
        <div :class="['relative z-10 px-5', settings.layout === 'horizontal' ? 'flex gap-4 pt-1' : 'pt-1 text-center']">

          <img v-if="template.school.logo" :src="template.school.logo" alt=""
            class="pointer-events-none absolute inset-0 -z-10 m-auto h-56 w-56 object-contain opacity-[0.05] grayscale" />

          <!-- Photo -->
          <div :class="settings.layout === 'horizontal' ? 'shrink-0 pt-2 pr-3' : 'flex justify-center'">
            <div :class="[
              'overflow-hidden border-[3px] shadow-md',
              settings.layout === 'horizontal' ? 'h-40 w-34' : 'mx-auto h-24 w-24',
              settings.profileShape === 'round' ? 'rounded-full' : 'rounded-xl'
            ]" :style="{ borderColor: settings.headerColor }">
              <img v-if="template.student.photo" :src="template.student.photo" alt="" class="h-full w-full object-cover"
                crossorigin="anonymous" />
              <div v-else class="flex h-full w-full items-center justify-center"
                :style="{ backgroundImage: `linear-gradient(to bottom right, ${settings.headerColor}22, ${settings.headerColor}44)` }">
                <span class="text-xl font-bold" :style="{ color: settings.headerColor }">{{
                  initials
                }}</span>
              </div>
            </div>
          </div>

          <!-- Name + fields -->
          <div class="min-w-0 flex-1">
            <h2 class="truncate text-lg font-black uppercase tracking-wide" style="line-height: 45px;"
              :style="{ color: settings.primaryTextColor }">
              {{
                template.student.name
              }}
            </h2>

            <div :class="settings.layout === 'vertical' ? 'inline-block text-left' : 'space-y-0.5'">
              <template v-for="field in activeFields" :key="field.key">
                <div v-if="field.enabled && field.cardSlot === 'front'"
                  class="flex gap-2 text-[11.5px] leading-6 items-center">
                  <span class="w-24 shrink-0 font-medium text-gray-500">{{
                    field.label
                  }}</span>
                  <span class="shrink-0 text-gray-300">:</span>
                  <span class="truncate font-bold" style="line-height: 26px;"
                    :style="{ color: settings.primaryTextColor }">
                    {{
                      (template.student as any)[field.key as keyof typeof template.student] ?? '—'
                    }}
                  </span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- ═════════ RIBBON + BARCODE + SIGNATURE ═════════ -->
        <div class="relative z-10 flex items-end justify-between gap-3 px-5 pb-4">
          <div class="-skew-x-12  px-4 py-2" :style="{ backgroundColor: settings.headerColor }">
            <span class="inline-block text-[11px] font-bold uppercase tracking-widest text-white">
              <span class="inline-block skew-x-12"
                style="line-height: 16px; position: relative; top: -5px;">Student</span>
            </span>
          </div>
          <div class="flex h-8 items-end gap-0.5">
            <span v-for="(w, i) in barcodeBars" :key="i" class="bg-gray-800"
              :style="{ width: `${w}px`, height: '100%' }" />
          </div>
          <div class="shrink-0 px-3 pt-1.5 pb-1 text-center">
            <img v-if="template.school.signature" :src="template.school.signature" alt="Principal's signature"
              class="mx-auto h-8 object-contain" />
            <p v-else class="text-lg leading-none text-gray-600 italic"
              style="font-family: 'Brush Script MT', cursive; line-height: 25px;">
              {{
                template.school.principal
                ||
                'Principal'
              }}
            </p>
            <p class="mt-1 border-t-2 text-[9px] font-bold uppercase tracking-widest"
              :style="{ borderColor: settings.headerColor, color: settings.headerColor }">
              Principal
            </p>
          </div>
        </div>

        <!-- ═════════ FOOTER ═════════ -->
        <div
          class="relative flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 h-10 text-center text-[10px] font-medium"
          :style="{ backgroundColor: settings.footerColor, color: settings.headerTextColor }">
          <!-- SCHOOL -->
          <div class="inline-flex items-center gap-1 footer-position font-semibold">
            <svg class="block size-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="m9 12 2 2 4-4" />
            </svg>

            <span class="block whitespace-nowrap footer-text">
              {{ template.school.name }}
            </span>
          </div>

          <!-- ADDRESS -->
          <div v-if="template.school.address" class="inline-flex items-center gap-1 footer-position">
            <svg class="block size-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
              <circle cx="12" cy="10" r="3" />
            </svg>

            <span class="block whitespace-nowrap footer-text">
              {{ template.school.address }}
            </span>
          </div>
        </div>

      </div>

      <div v-else
        class="id-card-face relative w-full overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_-12px_rgb(0_0_0_/_0.25)] ring-1 ring-black/5"
        :class="[settings.layout === 'vertical' ? 'max-w-[340px]' : 'max-w-[560px]', isPdfCapture && 'pdf-capture']">

        <!-- ═════════ HEADER ═════════ -->
        <div class="relative overflow-hidden px-5 pb-11 pt-5 text-center"
          :style="{ backgroundColor: settings.headerColor }">
          <p class="relative mt-2.5 text-xs font-bold uppercase tracking-[0.3em]"
            :style="{ color: settings.headerTextColor }">
            Student
            Information
          </p>
          <div class="absolute -bottom-10 left-1/2 h-16 w-[135%] -translate-x-1/2 rounded-[50%] bg-white" />
        </div>

        <!-- ═════════ BODY ═════════ -->
        <div :class="['relative z-10 px-5 pb-4 pt-1', settings.layout === 'horizontal' && 'grid grid-cols-2 gap-x-5']">

          <!-- Watermark — same faint crest treatment as the front, sitting
               behind the back details. -->
          <img v-if="template.school.logo" :src="template.school.logo" alt=""
            class="pointer-events-none absolute inset-0 -z-10 m-auto h-48 w-48 object-contain opacity-[0.05] grayscale" />

          <div>
            <div class="flex gap-2 items-center text-[11px] leading-5">
              <span class="w-20 shrink-0 font-medium text-gray-400">Parent</span>
              <span class="shrink-0 text-gray-300">:</span>
              <span class="truncate font-bold" :style="{ color: settings.primaryTextColor, lineHeight: '25px' }">{{
                template.student.parentContact
                ||
                '—'
              }}</span>
            </div>
            <div class="flex gap-2 items-center text-[11px] leading-5">
              <span class="w-20 shrink-0 font-medium text-gray-400">Emergency</span>
              <span class="shrink-0 text-gray-300">:</span>
              <span class="truncate font-bold" :style="{ color: settings.primaryTextColor, lineHeight: '25px' }">{{
                template.student.emergencyContact
                ||
                '—'
              }}</span>
            </div>
          </div>

          <div :class="settings.layout === 'horizontal' && 'mt-0'">
            <p class="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              School
              Address
            </p>
            <p class="mt-1 text-[11px] font-medium leading-5 text-gray-700">
              {{
                template.school.address
                ||
                '—'
              }}
            </p>
          </div>

          <div class="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3"
            :class="settings.layout === 'horizontal' && 'col-span-2'">
            <div class="flex items-center gap-1.5">
              <svg class="size-3.5 shrink-0 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path
                  d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <h4 class="text-xs font-semibold text-gray-900" style="line-height: 24px; position: relative; top: -6px;">
                Important
                Notice
              </h4>
            </div>
            <ul class="space-y-0.5 text-[10px] leading-4 text-gray-600">
              <li>
                •
                Property
                of
                {{
                  template.school.name
                }}.
                Report
                loss
                immediately.
              </li>
              <li>
                •
                Carry
                this
                ID
                at
                all
                times
                while
                on
                campus.
              </li>
            </ul>
          </div>

          <div class="mt-3 flex items-end justify-between gap-3"
            :class="settings.layout === 'horizontal' && 'col-span-2'">
            <div class="flex h-8 items-end gap-[1.5px]">
              <span v-for="(w, i) in barcodeBars" :key="i" class="bg-black"
                :style="{ width: `${w}px`, height: '100%' }" />
            </div>

            <div class="shrink-0 px-3 pt-1.5 pb-1 text-center">
              <img v-if="template.school.signature" :src="template.school.signature" alt="Principal's signature"
                class="mx-auto h-7 object-contain" />
              <p v-else class="text-base leading-none text-gray-600 italic"
                style="font-family: 'Brush Script MT', cursive; line-height: 22px;">
                {{ template.school.principal || 'Principal' }}
              </p>
              <p class="mt-1 border-t-2 text-[8px] font-bold uppercase tracking-widest"
                :style="{ borderColor: settings.headerColor, color: settings.headerColor }">
                Authorized Signature
              </p>
            </div>
          </div>
        </div>

        <!-- ═════════ FOOTER ═════════ -->
        <div
          class="relative flex flex-wrap h-10 items-center justify-center gap-x-4 gap-y-1 px-4 text-center text-[10px] font-medium py-3"
          :style="{ backgroundColor: settings.footerColor, color: settings.headerTextColor }">
          <!-- SCHOOL -->
          <div class="inline-flex footer-position items-center gap-1 font-semibold">
            <svg class="block size-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
              <path d="m9 12 2 2 4-4" />
            </svg>

            <span class="block whitespace-nowrap footer-text">
              {{ template.school.name }}
            </span>
          </div>

          <!-- ADDRESS -->
          <div v-if="template.school.address" class="inline-flex items-center gap-1 footer-position">
            <svg class="block size-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
              <circle cx="12" cy="10" r="3" />
            </svg>

            <span class="block whitespace-nowrap footer-text">
              {{ template.school.address }}
            </span>
          </div>
        </div>
      </div>

    </div>

  </UCard>
</template>

<script setup lang="ts">
interface FieldDef {
  key: string
  label: string
  icon: string
  cardSlot: 'front' | 'back'
  enabled: boolean
  required?: boolean
}

interface Settings {
  layout: 'vertical' | 'horizontal'
  profileShape: 'round' | 'square'
  headerColor: string
  footerColor: string
  headerTextColor: string
  primaryTextColor: string
  widthMm: number
  heightMm: number
  bgImageUrl: string
  bgOpacity: number
}

interface Template {
  id: string | string[]
  name: string
  type: string
  level: string
  createdBy: string
  updatedAt: string
  cardsIssued: number
  validityYears: number
  accentColor: string
  accentColorDark: string
  school: {
    name: string
    logo: string
    principal: string
    signature?: string
    address: string
    tagline?: string
  }
  student: {
    name: string
    admissionNo: string
    class: string
    gender: string
    dob: string
    expiryDate: string
    emergencyContact: string
    parentContact: string
    photo?: string
  }
}

const props = defineProps<{
  template: Template
  settings: Settings
  isPdfCapture?: boolean
  activeFields: FieldDef[]
  side?: 'front' | 'back'
}>()

const emit = defineEmits<{ 'update:side': [value: 'front' | 'back'] }>()

// Externally controllable (via `side`/`update:side`) so a parent can flip the
// card programmatically — e.g. to capture both faces when exporting a PDF —
// while still working uncontrolled if no `side` prop is passed.
const internalSide = ref<'front' | 'back'>(props.side ?? 'front')

const side = computed({
  get: () => props.side ?? internalSide.value,
  set: (value) => {
    internalSide.value = value
    emit('update:side', value)
  }
})

// Fallback avatar for when there's no photo yet — initials read better than a
// generic person icon and still feel intentional rather than "missing".
const initials = computed(() => {
  const parts = props.template.student.name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
})

const barcodeBars = computed(() => {
  const seed = props.template.student.admissionNo || props.template.student.name
  const bars: number[] = []
  for (let i = 0; i < 34; i++) {
    const code = seed.charCodeAt(i % seed.length) + i
    bars.push((code % 3) + 1)
  }
  return bars
})
</script>
<style>
/* Normal browser preview */
.footer-text {
  line-height: 12px;
}

/* PDF-only adjustment */
.pdf-capture .footer-text {
  position: relative;
  top: -5px;
}

.pdf-capture .footer-position {
  margin-top: -12px;
}
</style>