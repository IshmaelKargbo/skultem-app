<template>
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

    <div class="flex justify-center overflow-auto">

      <!-- ═════════════════════════════════════════════════════════════ -->
      <!-- ID CARD: FRONT -->
      <!-- ═════════════════════════════════════════════════════════════ -->
      <div v-if="side === 'front'" :class="[
        'relative w-full overflow-hidden bg-white shadow-[0_20px_50px_-12px_rgb(0_0_0_/_0.25)] ring-1 ring-black/5',
        settings.layout === 'vertical'
          ? 'max-w-[420px] rounded-[28px]'
          : 'max-w-[600px] rounded-[20px]'
      ]">

        <!-- Background image layer -->
        <div v-if="settings.bgImageUrl" class="pointer-events-none absolute inset-0 z-0" :style="{
          backgroundImage: `url(${settings.bgImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: settings.bgOpacity / 100
        }" />

        <div :class="['relative z-10', settings.layout === 'horizontal' && 'flex']">

          <!-- ═════════ HEADER ═════════ -->
          <div :class="[
            'px-6 pb-4 pt-1 text-center text-xs font-semibold uppercase tracking-[0.25em]',
            settings.layout === 'horizontal' && 'flex flex-col justify-center w-48 shrink-0 pb-6'
          ]" :style="{ backgroundColor: settings.headerColor }">
            <div :class="[
              'flex items-center justify-center space-y-4',
              settings.layout === 'vertical' ? 'flex-col h-40' : 'flex-col h-full py-6 gap-4'
            ]">
              <!-- School Logo -->
              <div class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/95 p-2 shadow-sm">
                <img :src="template.school.logo" class="size-full object-contain" alt="School logo">
              </div>
              <!-- School Name & Card Type -->
              <div class="min-w-0">
                <p class="text-center text-base font-semibold uppercase tracking-wide"
                  :style="{ color: settings.headerTextColor }">
                  {{ template.school.name }}
                </p>
                <p class="mt-0.5 text-xs font-medium uppercase text-center tracking-widest"
                  :style="{ color: settings.headerTextColor, opacity: 0.75 }">
                  {{ settings.audience === 'student' ? 'Student' : 'Staff' }} ID Card
                </p>
              </div>
            </div>
          </div>

          <!-- ═════════ CARD BODY ═════════ -->
          <div :class="[
            'relative flex-1',
            settings.layout === 'horizontal' && 'flex flex-col'
          ]">

            <!-- Decorative Background -->
            <div class="absolute inset-0 overflow-hidden pointer-events-none">
              <div class="absolute -right-12 top-0 h-40 w-40 rounded-full opacity-5"
                :style="{ backgroundColor: settings.headerColor }" />
              <div class="absolute left-0 bottom-0 h-32 w-32 rounded-full opacity-5"
                :style="{ backgroundColor: settings.headerColor }" />

              <!-- Watermark -->
              <div class="absolute inset-0 flex items-center justify-center opacity-[0.04]">
                <img :src="template.school.logo" class="w-52 h-52 object-contain">
              </div>
            </div>

            <!-- ═════════ PROFILE PHOTO ═════════ -->
            <div :class="[
              'relative z-10 flex',
              settings.layout === 'vertical'
                ? '-mt-12 justify-center'
                : 'mt-6 px-6'
            ]">
              <div class="relative">
                <!-- Photo Frame with improved styling -->
                <div :class="[
                  'overflow-hidden border-4 border-white bg-gradient-to-b from-gray-100 to-gray-200 shadow-xl mt-4',
                  settings.profileShape === 'round'
                    ? 'h-28 w-28 rounded-full'
                    : 'h-28 w-28 rounded-3xl'
                ]">
                  <!-- Replace this with student image -->
                  <div class="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300">
                    <UIcon name="i-lucide-user" class="text-5xl text-gray-400" />
                  </div>
                </div>

                <!-- Optional ring around photo -->
                <div :class="[
                  'absolute inset-0 pointer-events-none',
                  settings.profileShape === 'round'
                    ? 'rounded-full'
                    : 'rounded-3xl',
                  'ring-2 ring-offset-2 ring-offset-white',
                  'mt-4'
                ]" :style="{ 
                  ringColor: settings.headerColor + '40'
                }" />

              </div>
            </div>

            <!-- ═════════ STUDENT/STAFF INFO ═════════ -->
            <div :class="[
              'relative z-10 px-6',
              settings.layout === 'vertical'
                ? 'pt-5 text-center'
                : 'pt-4 text-left'
            ]">
              <h2 class="text-2xl font-black tracking-wide uppercase"
                :style="{ color: settings.primaryTextColor }">
                {{ template.student.name }}
              </h2>

              <p class="mt-1 text-sm font-medium text-gray-500">
                {{ template.student.class }}
              </p>
            </div>

            <!-- ═════════ INFORMATION FIELDS ═════════ -->
            <div class="relative z-10 mt-6 px-6 pb-6">
              <div class="grid grid-cols-2 gap-3">
                <template v-for="field in activeFields" :key="field.key">
                  <div v-if="field.enabled && field.cardSlot === 'front'"
                    class="group rounded-2xl border border-gray-200 bg-white/90 p-3 shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300">

                    <div class="flex items-center gap-2">
                      <!-- Icon with header color background -->
                      <div class="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0" :style="{
                        backgroundColor: settings.headerColor + '15'
                      }">
                        <UIcon :name="field.icon" :style="{ color: settings.headerColor }" class="size-4" />
                      </div>

                      <div class="min-w-0">
                        <p class="text-[10px] uppercase tracking-widest text-gray-400">
                          {{ field.label }}
                        </p>

                        <p class="truncate text-sm font-bold" :style="{ color: settings.primaryTextColor }">
                          {{
                            (template.student as any)[field.key as keyof typeof template.student] ?? "—"
                          }}
                        </p>
                      </div>
                    </div>

                  </div>
                </template>
              </div>
            </div>

          </div>

        </div>

        <!-- ═════════ SIGNATURE STRIP ═════════ -->
        <div class="relative border-t border-dashed border-gray-200 px-6 py-3">
          <div class="flex items-center justify-between text-[10px] text-gray-400">
            <span>Authorized Signature</span>
            <span class="italic">{{ template.school.principal }}</span>
          </div>
        </div>

        <!-- ═════════ FOOTER ═════════ -->
        <div class="relative border-t border-gray-100 px-6 py-3 text-center text-[11px] font-medium"
          :style="{ backgroundColor: settings.footerColor, color: settings.headerTextColor }">
          If found, kindly return to {{ template.school.name }}
        </div>

      </div>

      <!-- ═════════════════════════════════════════════════════════════ -->
      <!-- ID CARD: BACK -->
      <!-- ═════════════════════════════════════════════════════════════ -->
      <div v-else
        class="relative w-full max-w-[420px] overflow-hidden rounded-[32px] bg-white shadow-[0_25px_80px_-20px_rgba(0,0,0,.28)] ring-1 ring-black/5">

        <!-- Decorative Background -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-10"
            :style="{ backgroundColor: settings.headerColor }" />

          <div class="absolute -left-20 bottom-0 h-48 w-48 rounded-full opacity-5"
            :style="{ backgroundColor: settings.headerColor }" />

          <!-- Watermark -->
          <div class="absolute inset-0 flex items-center justify-center opacity-[0.04]">
            <img :src="template.school.logo" class="h-52 w-52 object-contain" alt="">
          </div>
        </div>

        <div class="relative z-10">

          <!-- ═════════ HEADER ═════════ -->
          <div class="px-6 py-5 text-center" :style="{ backgroundColor: settings.headerColor }">
            <div class="flex justify-center mb-2">
              <div class="rounded-xl bg-white p-2 shadow">
                <img :src="template.school.logo" class="h-10 w-10 object-contain">
              </div>
            </div>

            <h3 class="text-sm font-bold uppercase tracking-[0.35em]"
              :style="{ color: settings.headerTextColor }">
              {{ settings.audience === 'student' ? 'Student' : 'Staff' }} Information
            </h3>

            <p class="mt-1 text-xs opacity-80" :style="{ color: settings.headerTextColor }">
              Scan QR Code to Verify Identity
            </p>

          </div>

          <!-- ═════════ CONTACTS ═════════ -->
          <div class="mt-6 grid grid-cols-2 gap-4 px-6">

            <!-- Parent/Primary Contact -->
            <div class="rounded-2xl border bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-sm">
              <div class="flex items-center gap-2">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
                  :style="{ backgroundColor: settings.headerColor + '15' }">
                  <UIcon name="i-lucide-users" :style="{ color: settings.headerColor }" class="size-4" />
                </div>

                <div class="min-w-0">
                  <p class="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                    {{ settings.audience === 'student' ? 'Parent' : 'Manager' }}
                  </p>
                  <p class="text-xs font-semibold text-gray-700 truncate">
                    {{ template.student.parentContact }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Emergency/Secondary Contact -->
            <div class="rounded-2xl border bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-sm">
              <div class="flex items-center gap-2">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
                  :style="{ backgroundColor: settings.headerColor + '15' }">
                  <UIcon name="i-lucide-phone-call" :style="{ color: settings.headerColor }" class="size-4" />
                </div>

                <div class="min-w-0">
                  <p class="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                    Emergency
                  </p>
                  <p class="text-xs font-semibold text-gray-700 truncate">
                    {{ template.student.emergencyContact }}
                  </p>
                </div>
              </div>
            </div>

          </div>

          <!-- ═════════ ADDRESS ═════════ -->
          <div class="mt-5 px-6">
            <div class="rounded-2xl border bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-sm">
              <div class="flex gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
                  :style="{ backgroundColor: settings.headerColor + '15' }">
                  <UIcon name="i-lucide-map-pin" :style="{ color: settings.headerColor }" class="size-5" />
                </div>

                <div class="min-w-0">
                  <p class="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                    School Address
                  </p>
                  <p class="mt-1 text-xs font-medium leading-5 text-gray-700">
                    {{ template.school.address }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- ═════════ IMPORTANT NOTICE ═════════ -->
          <div class="mt-5 px-6">
            <div class="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-4">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-shield-check" class="text-amber-600 flex-shrink-0" />
                <h4 class="font-semibold text-gray-900">
                  Important Notice
                </h4>
              </div>

              <ul class="mt-3 space-y-1.5 text-[11px] leading-4 text-gray-700">
                <li>• This card remains the property of {{ template.school.name }}.</li>
                <li>• Carry this ID while on campus.</li>
                <li>• Report lost cards immediately.</li>
                <li>• Do not alter or duplicate this card.</li>
              </ul>
            </div>
          </div>

          <!-- ═════════ QR CODE ═════════ -->
          <div class="px-6 pt-6 pb-4">
            <div class="flex justify-center">
              <div class="rounded-3xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-4 shadow-inner">
                <UIcon name="i-lucide-qr-code" class="text-6xl text-gray-400" />
              </div>
            </div>
          </div>

          <!-- ═════════ FOOTER ═════════ -->
          <div class="px-6 py-4 text-center font-semibold tracking-wide" :style="{
            backgroundColor: settings.footerColor,
            color: settings.headerTextColor
          }">
            {{ template.school.name }}
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
  audience: 'student' | 'staff'
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
    address: string
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
  }
}

defineProps<{
  template: Template
  settings: Settings
  activeFields: FieldDef[]
}>()

const side = ref<'front' | 'back'>('front')
</script>
