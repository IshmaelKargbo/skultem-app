<template>
  <UCard :ui="{ body: 'p-6 sm:p-10' }"
    class="bg-[radial-gradient(circle_at_top,_var(--ui-bg-muted)_0%,_transparent_70%)]">

    <!-- Front / Back toggle - same pill-tab look as the app's Tab component (that one is link-based,
         this switches a local value instead of the route). -->
    <div class="mb-6 flex justify-center">
      <div class="inline-flex gap-1 rounded-3xl border border-gray-200 bg-white p-1.5 dark:border-gray-800 dark:bg-gray-900">
        <button v-for="tab in sideTabs" :key="tab.value" type="button"
          class="flex items-center gap-1.5 rounded-3xl px-4 py-2 text-[12px] sm:text-sm whitespace-nowrap transition-all duration-200"
          :class="side === tab.value
            ? 'bg-secondary-100 text-secondary-600 font-semibold dark:bg-secondary-800 dark:text-secondary-200'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'"
          @click="side = tab.value">
          <UIcon :name="tab.icon" class="size-4 shrink-0" />
          {{ tab.label }}
        </button>
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
                  template.school.tagline || `${cardTypeLabel} Identification`
                }}
              </p>
            </div>

          </div>

          <div class="absolute -bottom-10 left-1/2 h-16 w-[135%] -translate-x-1/2 rounded-[50%] bg-white" />
        </div>

        <div v-if="settings.layout !== 'vertical'"
          class="absolute z-50 top-3 right-3 sm:top-5 sm:right-5 flex h-20 w-20 sm:h-36 sm:w-36 items-center justify-center overflow-hidden bg-white"
          :style="{ '--tw-ring-color': settings.headerTextColor + '30', borderRadius: (settings.logoRadius ?? 50) + '%' }">
          <!-- Fixed-size white container; the logo is fitted inside it (object-contain keeps its
               proportions) and scaled by the Logo size setting, so an oversized logo never
               overflows the container. -->
          <img :src="template.school.logo" class="object-contain" alt="School crest"
            :style="{ width: Math.min(settings.logoSize || 100, 100) + '%', height: Math.min(settings.logoSize || 100, 100) + '%' }">
        </div>
        <div :class="['relative z-10 px-4 sm:px-5', settings.layout === 'horizontal' ? 'flex gap-3 sm:gap-4 pt-1' : 'pt-1 text-center']">

          <!-- Photo -->
          <div :class="settings.layout === 'horizontal' ? 'shrink-0 pt-2 pr-2 sm:pr-3' : 'flex justify-center'">
            <div :class="[
              'overflow-hidden border-[3px] shadow-md',
              settings.layout === 'horizontal' ? 'h-28 w-24 sm:h-40 sm:w-34' : 'mx-auto h-24 w-24',
              settings.profileShape === 'round' ? 'rounded-full' : 'rounded-xl'
            ]" :style="{ borderColor: settings.headerColor }">
              <!-- No crossorigin attribute - R2's public bucket URL sends no CORS headers (see
                   R2StorageService.downloadAsDataUri), so tagging this crossorigin="anonymous"
                   makes the browser refuse to load it at all rather than just tainting a canvas
                   capture. The logo/signature images on this card already load the same way for
                   the same reason - PDF/print capture separately swaps those two to a same-origin
                   data: URI right before capturing (see getBrandingAssets() in pages/id-cards/[id].vue);
                   the photo isn't part of that swap yet, so it may still be missing from exported
                   PDFs even though it now displays correctly on screen. -->
              <img v-if="person.photo" :src="person.photo" alt="" class="h-full w-full object-cover" />
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
                person.name
              }}
            </h2>

            <div :class="settings.layout === 'vertical' ? 'inline-block text-left' : 'space-y-0.5'">
              <template v-for="field in activeFields" :key="field.key">
                <div v-if="field.enabled && field.cardSlot === 'front'"
                  class="flex gap-2 text-[11.5px] leading-6 items-center">
                  <span class="w-16 sm:w-24 shrink-0 font-medium text-gray-500">{{
                    field.label
                  }}</span>
                  <span class="shrink-0 text-gray-300">:</span>
                  <span class="min-w-0 truncate font-bold" style="line-height: 26px;"
                    :style="{ color: settings.primaryTextColor }">
                    {{
                      person[field.key] ?? '—'
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
                style="line-height: 16px; position: relative; top: -5px;">{{ cardTypeLabel }}</span>
            </span>
          </div>
          <div class="flex h-8 items-end gap-0.5">
            <span v-for="(w, i) in barcodeBars" :key="i" class="bg-gray-800"
              :style="{ width: `${w}px`, height: '100%' }" />
          </div>
          <div class="shrink-0 px-3 pt-1.5 pb-1 text-center">
            <img v-if="template.school.signature" :src="template.school.signature" alt="Principal's signature"
              class="mx-auto object-contain" :style="signatureStyle(2)" />
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
          <!-- ADDRESS -->
          <div v-if="footerAddress" class="inline-flex items-center gap-1 footer-position">
            <svg class="block size-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
              <circle cx="12" cy="10" r="3" />
            </svg>

            <span class="block whitespace-nowrap footer-text">
              {{ footerAddress }}
            </span>
          </div>
        </div>

      </div>

      <div v-else
        class="id-card-face relative w-full overflow-hidden rounded-[20px] bg-white shadow-[0_20px_50px_-12px_rgb(0_0_0_/_0.25)] ring-1 ring-black/5"
        :class="[settings.layout === 'vertical' ? 'max-w-[340px]' : 'max-w-[560px]', isPdfCapture && 'pdf-capture']">

        <!-- Background image layer - same configurable image as the front (Background section in
             settings), instead of the fixed faint school-crest watermark this used to show. -->
        <div v-if="settings.bgImageUrl" class="pointer-events-none absolute inset-0 z-0" :style="{
          backgroundImage: `url(${settings.bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: settings.bgOpacity / 100
        }" />

        <!-- ═════════ HEADER ═════════ -->
        <div class="relative overflow-hidden px-5 pb-11 pt-5 text-center"
          :style="{ backgroundColor: settings.headerColor }">
          <p class="relative mt-2.5 text-xs font-bold uppercase tracking-[0.3em]"
            :style="{ color: settings.headerTextColor }">
            {{ cardTypeLabel }} Information
          </p>
          <div class="absolute -bottom-10 left-1/2 h-16 w-[135%] -translate-x-1/2 rounded-[50%] bg-white" />
        </div>

        <!-- ═════════ BODY ═════════ -->
        <div :class="['relative z-10 px-4 sm:px-5 pb-4 pt-1', settings.layout === 'horizontal' && 'grid grid-cols-1 sm:grid-cols-2 gap-x-5']">

          <div v-if="cardType === 'staff'">
            <div class="flex gap-2 items-center text-[11px] leading-5">
              <span class="w-20 shrink-0 font-medium text-gray-400">Phone</span>
              <span class="shrink-0 text-gray-300">:</span>
              <span class="truncate font-bold" :style="{ color: settings.primaryTextColor, lineHeight: '25px' }">{{
                formatPhoneSL(person.phone)
                ||
                '—'
              }}</span>
            </div>
            <!-- A staff member's emergency contact is the school itself. -->
            <div class="flex gap-2 items-center text-[11px] leading-5">
              <span class="w-20 shrink-0 font-medium text-gray-400">Emergency</span>
              <span class="shrink-0 text-gray-300">:</span>
              <span class="truncate font-bold" :style="{ color: settings.primaryTextColor, lineHeight: '25px' }">{{
                formatPhoneSL(template.school.phone)
                ||
                '—'
              }}</span>
            </div>
          </div>
          <div v-else>
            <div class="flex gap-2 items-center text-[11px] leading-5">
              <span class="w-20 shrink-0 font-medium text-gray-400">Phone</span>
              <span class="shrink-0 text-gray-300">:</span>
              <span class="truncate font-bold" :style="{ color: settings.primaryTextColor, lineHeight: '25px' }">{{
                formatPhoneSL(person.parentContact)
                ||
                '—'
              }}</span>
            </div>
            <div class="flex gap-2 items-center text-[11px] leading-5">
              <span class="w-20 shrink-0 font-medium text-gray-400">Emergency</span>
              <span class="shrink-0 text-gray-300">:</span>
              <span class="truncate font-bold" :style="{ color: settings.primaryTextColor, lineHeight: '25px' }">{{
                formatPhoneSL(template.school.phone)
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

          <div class="mt-3 rounded-xl border border-gray-300 bg-gray-100 p-3"
            :class="settings.layout === 'horizontal' && 'sm:col-span-2'">
            <div class="flex items-center gap-1.5">
              <svg class="size-3.5 shrink-0 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor"
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
                in
                school.
              </li>
            </ul>
          </div>

          <div class="mt-3 flex items-end justify-between gap-3"
            :class="settings.layout === 'horizontal' && 'sm:col-span-2'">
            <div class="flex h-8 items-end gap-[1.5px]">
              <span v-for="(w, i) in barcodeBars" :key="i" class="bg-black"
                :style="{ width: `${w}px`, height: '100%' }" />
            </div>

            <div class="shrink-0 px-3 pt-1.5 pb-1 text-center">
              <img v-if="template.school.signature" :src="template.school.signature" alt="Principal's signature"
                class="mx-auto object-contain" :style="signatureStyle(1.75)" />
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
          <!-- ADDRESS -->
          <div v-if="footerAddress" class="inline-flex items-center gap-1 footer-position">
            <svg class="block size-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
              <circle cx="12" cy="10" r="3" />
            </svg>

            <span class="block whitespace-nowrap footer-text">
              {{ footerAddress }}
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
  logoSize?: number
  logoRadius?: number
  signatureSize?: number
  accentColor: string
  accentColorDark: string
  school: {
    name: string
    logo: string
    principal: string
    signature?: string
    address: string
    phone?: string
    tagline?: string
  }
  student?: {
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
  staff?: {
    name: string
    staffId: string
    designation: string
    gender: string
    expiryDate: string
    phone: string
    photo?: string
  }
}

// Signature height scales from its default (rem) by the Signature size setting; max-width keeps a
// very wide signature from pushing the barcode off the card.
function signatureStyle(baseRem: number) {
  return { height: `${baseRem * (props.settings.signatureSize || 100) / 100}rem`, maxWidth: '9rem' }
}

// The footer is a single short line, so it carries only the street and city - the school address is
// joined street, city, chiefdom, district, region everywhere it's built, so those are the first two
// parts. The back of the card still prints the full address.
const footerAddress = computed(() =>
  (props.template.school.address || '').split(',').map(p => p.trim()).filter(Boolean).slice(0, 2).join(', '))

const props = withDefaults(defineProps<{
  template: Template
  settings: Settings
  isPdfCapture?: boolean
  activeFields: FieldDef[]
  side?: 'front' | 'back'
  // Same card design either way (colours/layout come from `settings`) - this only picks which of
  // `template.student` / `template.staff` supplies the data and a couple of type-specific labels
  // ("Student"/"Staff" ribbon, back-side contact rows).
  cardType?: 'student' | 'staff'
}>(), {
  cardType: 'student'
})

// The one field every caller of this component used to reach for directly as `template.student`
// - now resolved from whichever half of the template applies. Kept as `any` since the two shapes
// diverge (admissionNo/class vs staffId/designation) and activeFields already looks keys up
// dynamically the same way.
// Sierra Leone numbers as +232 XX XXX XXX - accepts 077654321, 77654321, +23277654321 or 23277654321.
// Anything that doesn't look like one is shown as typed.
function formatPhoneSL(raw?: string | null) {
  const value = (raw || '').trim()
  if (!value) return ''
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('232')) digits = digits.slice(3)
  else if (digits.startsWith('0')) digits = digits.slice(1)
  if (digits.length !== 8) return value
  return `+232 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
}

const person = computed<any>(() => (props.cardType === 'staff' ? props.template.staff : props.template.student) || {})
const cardTypeLabel = computed(() => (props.cardType === 'staff' ? 'Staff' : 'Student'))

const sideTabs = [
  { value: 'front', label: 'Front', icon: 'i-lucide-id-card' },
  { value: 'back', label: 'Back', icon: 'i-lucide-flip-horizontal-2' }
] as const

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
  const parts = (person.value.name || '').trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
})

const barcodeBars = computed(() => {
  const seed = person.value.admissionNo || person.value.staffId || person.value.name || 'id'
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