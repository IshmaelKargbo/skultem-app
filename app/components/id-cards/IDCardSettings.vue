<template>
  <Transition enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2">
    <!-- Split into one card per group instead of a single flat card with divider lines - this
         column only gets 1/3 of the page grid now (the preview took the other 2/3), so the old
         sm:grid-cols-2/3 rows inside a single card would squeeze against the *container* width
         while still thinking they had viewport-width room. Separate cards stack cleanly at any
         column width and match the segmented-card look already used elsewhere (ProfileTab,
         Payslip Design). -->
    <div v-if="modelValue" class="space-y-5">

      <div class="flex items-center justify-between px-0.5">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-settings-2" class="size-5 text-primary" />
          <h3 class="font-semibold">ID Card Settings</h3>
        </div>
        <UButton variant="link" color="neutral" size="xs" class="p-0" @click="resetSettings">
          Reset to defaults
        </UButton>
      </div>

      <!-- ── Template & Layout ── -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-layout-template" class="size-5 text-primary" />
            <h3 class="font-semibold">Template & Layout</h3>
          </div>
        </template>

        <div class="space-y-5">
        
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Layout type</label>
            <div class="flex flex-wrap gap-2">
              <button v-for="layout in layoutOptions" :key="layout.value" :class="[
                'flex flex-1 min-w-25 flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-medium transition-all',
                settings.layout === layout.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-default bg-muted/30 text-muted hover:border-primary/40'
              ]" @click="updateSetting('layout', layout.value)">
                <div :class="[
                  'rounded bg-current/20 border border-current/30',
                  layout.value === 'vertical' ? 'h-10 w-7' : 'h-7 w-10'
                ]" />
                {{ layout.label }}
              </button>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium">Profile image style</label>
            <div class="flex flex-wrap gap-2">
              <button v-for="shape in profileShapeOptions" :key="shape.value" :class="[
                'flex flex-1 min-w-25 flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-medium transition-all',
                settings.profileShape === shape.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-default bg-muted/30 text-muted hover:border-primary/40'
              ]" @click="updateSetting('profileShape', shape.value)">
                <div :class="[
                  'size-8 bg-current/20 border border-current/30',
                  shape.value === 'round' ? 'rounded-full' : 'rounded-md'
                ]" />
                {{ shape.label }}
              </button>
            </div>
          </div>
        </div>
      </UCard>

      <!-- ── Colour ── -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-palette" class="size-5 text-primary" />
            <h3 class="font-semibold">Colour</h3>
          </div>
        </template>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Header colour</label>
            <ColorPicker :model-value="settings.headerColor" @update:model-value="(val) => updateSetting('headerColor', val)" />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium">Footer colour</label>
            <ColorPicker :model-value="settings.footerColor" @update:model-value="(val) => updateSetting('footerColor', val)" />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium">Header / footer text</label>
            <ColorPicker :model-value="settings.headerTextColor" @update:model-value="(val) => updateSetting('headerTextColor', val)" />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium">Primary text</label>
            <ColorPicker :model-value="settings.primaryTextColor" @update:model-value="(val) => updateSetting('primaryTextColor', val)" />
          </div>
        </div>
      </UCard>

      <!-- ── Dimensions & Validity ── -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-ruler" class="size-5 text-primary" />
            <h3 class="font-semibold">Dimensions & Validity</h3>
          </div>
        </template>

        <div class="space-y-5">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Card size (mm)</label>
            <div class="flex items-center gap-3">
              <UInput :model-value="settings.widthMm" type="number" min="50" max="200" placeholder="85"
                class="flex-1" @update:model-value="(val) => updateSetting('widthMm', val)">
                <template #trailing>
                  <span class="text-xs text-muted">mm</span>
                </template>
              </UInput>
              <span class="text-muted">×</span>
              <UInput :model-value="settings.heightMm" type="number" min="50" max="200" placeholder="54"
                class="flex-1" @update:model-value="(val) => updateSetting('heightMm', val)">
                <template #trailing>
                  <span class="text-xs text-muted">mm</span>
                </template>
              </UInput>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-medium">Card valid for</label>
            <UInput :model-value="settings.validityYears" type="number" min="1" max="10" placeholder="1"
              @update:model-value="(val) => updateSetting('validityYears', val)">
              <template #trailing>
                <span class="text-xs text-muted">year{{ Number(settings.validityYears) === 1 ? '' : 's' }}</span>
              </template>
            </UInput>
            <p class="text-xs text-muted">
              The "Valid Until" field is calculated from today's date plus this many years.
            </p>
          </div>
        </div>
      </UCard>

      <!-- ── Background ── -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-image" class="size-5 text-primary" />
            <h3 class="font-semibold">Background</h3>
          </div>
        </template>

        <div class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-sm font-medium">Background image</label>
            <div
              class="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-default bg-muted/20 px-6 py-5 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
              @click="bgImageInput?.click()" @dragover.prevent @drop.prevent="onBgDrop">
              <input ref="bgImageInput" type="file" accept="image/*" class="hidden" @change="onBgImageChange" />

              <template v-if="settings.bgImageUrl">
                <div class="relative">
                  <img :src="settings.bgImageUrl" alt="Background preview"
                    class="h-20 w-32 rounded-lg object-cover shadow" />
                  <button
                    class="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                    @click.stop="clearBgImage">
                    <UIcon name="i-lucide-x" class="size-3" />
                  </button>
                </div>
                <p class="text-xs text-muted">Click to replace</p>
              </template>

              <template v-else>
                <div class="flex size-10 items-center justify-center rounded-xl bg-muted">
                  <UIcon name="i-lucide-image-plus" class="size-5 text-muted" />
                </div>
                <div>
                  <p class="text-sm font-medium">Upload background image</p>
                  <p class="mt-0.5 text-xs text-muted">PNG, JPG or SVG · Drag & drop or click</p>
                </div>
              </template>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-sm font-medium">Opacity</label>
              <span class="text-sm font-semibold text-primary">{{ settings.bgOpacity }}%</span>
            </div>
            <div class="relative h-5 flex items-center">
              <div class="absolute inset-x-0 h-1.5 rounded-full overflow-hidden">
                <div class="h-full bg-muted" />
                <div class="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
                  :style="{ width: settings.bgOpacity + '%' }" />
              </div>
              <input type="range" :value="settings.bgOpacity" min="0" max="100" step="5"
                @input="(e) => updateSetting('bgOpacity', Number((e.target as HTMLInputElement).value))"
                class="relative w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer" />
            </div>
            <div class="flex justify-between text-[10px] text-muted">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </UCard>

      <!-- ── Select Fields ── -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-list-checks" class="size-5 text-primary" />
              <h3 class="font-semibold">Fields <span class="font-normal text-muted">({{ fieldsLabel }})</span></h3>
            </div>
            <p class="text-[11px] text-muted">Click to toggle</p>
          </div>
        </template>

        <div class="grid gap-2">
          <button v-for="field in activeFields" :key="field.key" :class="[
            'group flex items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left text-sm transition-all',
            field.enabled
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-default bg-muted/20 text-muted hover:border-primary/30'
          ]" @click="toggleField(field)">
            <div :class="[
              'flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors',
              field.enabled ? 'border-primary bg-primary text-white' : 'border-default bg-white'
            ]">
              <UIcon v-if="field.enabled" name="i-lucide-check" class="size-3.5" />
            </div>
            <UIcon :name="field.icon" class="size-4 shrink-0" />
            <span class="font-medium">{{ field.label }}</span>
            <UBadge v-if="field.required" color="warning" variant="subtle" size="xs" class="ml-auto">
              Required
            </UBadge>
          </button>
        </div>
      </UCard>

      <!-- ── Actions ── -->
      <UCard :ui="{ body: 'p-4' }" class="sticky bottom-0 lg:static">
        <div class="flex gap-2">
          <UButton variant="outline" color="neutral" class="flex-1 justify-center"
            @click="() => { emit('update:modelValue', false); emit('close') }">
            Cancel
          </UButton>
          <UButton color="primary" :trailing-icon="SAVE_ICON" class="flex-1 justify-center" @click="saveSettings">
            Save settings
          </UButton>
        </div>
      </UCard>

    </div>
  </Transition>
</template>

<script setup lang="ts">
import ColorPicker from './ColorPicker.vue'

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
  preset: string
  headerColor: string
  footerColor: string
  headerTextColor: string
  primaryTextColor: string
  widthMm: number
  heightMm: number
  bgImageUrl: string
  bgOpacity: number
  validityYears: number
}

const props = withDefaults(defineProps<{
  modelValue: boolean
  settings: Settings
  activeFields: FieldDef[]
  defaultSettings: Settings
  // 'Student' or 'Staff' - which field set `activeFields` currently holds, shown next to the
  // "Fields" heading since the same card design (colours/layout) now backs both card types.
  fieldsLabel?: string
}>(), {
  fieldsLabel: 'Student'
})

const emit = defineEmits<{
  'update:modelValue': [boolean]
  'update:settings': [Settings]
  'update:activeFields': [FieldDef[]]
  'close': []
  'save': []
}>()

const { success } = useNotify()
const bgImageInput = ref<HTMLInputElement | null>(null)

const layoutOptions = [
  { value: 'vertical', label: 'Vertical' },
  { value: 'horizontal', label: 'Horizontal' },
]

const profileShapeOptions = [
  { value: 'round', label: 'Round' },
  { value: 'square', label: 'Square' },
]

// Create local copies that are synced with props
const settings = computed({
  get: () => props.settings,
  set: (newSettings) => {
    emit('update:settings', newSettings)
  }
})

const activeFields = computed({
  get: () => props.activeFields,
  set: (newFields) => {
    emit('update:activeFields', newFields)
  }
})

function updateSetting(key: keyof Settings, value: any) {
  const updated = { ...settings.value, [key]: value }
  emit('update:settings', updated)
}

function toggleField(field: FieldDef) {
  const idx = activeFields.value.findIndex(f => f.key === field.key)
  if (idx !== -1) {
    const updated = [...activeFields.value]
    updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled }
    emit('update:activeFields', updated)
  }
}

function onBgImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadBgFile(file)
}

function onBgDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) loadBgFile(file)
}

function loadBgFile(file: File) {
  const reader = new FileReader()
  reader.onload = (ev) => {
    const updated = { ...settings.value, bgImageUrl: ev.target?.result as string }
    emit('update:settings', updated)
  }
  reader.readAsDataURL(file)
}

function clearBgImage() {
  const updated = { ...settings.value, bgImageUrl: '' }
  emit('update:settings', updated)
  if (bgImageInput.value) bgImageInput.value.value = ''
}

function resetSettings() {
  emit('update:settings', { ...props.defaultSettings })
  const defaultFields = props.activeFields.map(f => ({
    ...f,
    enabled: true
  }))
  emit('update:activeFields', defaultFields)
}

function saveSettings() {
  emit('save')
  success('Settings saved')
}
</script>
