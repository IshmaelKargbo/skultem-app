<template>
  <Transition enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2">
    <UCard v-if="modelValue" :ui="{ body: 'p-6 overflow-y-auto max-h-[75vh]' }">

      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-settings-2" class="size-5 text-primary" />
            <h3 class="font-semibold">ID Card Settings</h3>
          </div>
          <p class="text-xs text-muted">Configure layout, colours and fields.</p>
        </div>
      </template>

      <div class="space-y-7">

        <!-- ── Target Audience ── -->
        <section>
          <p class="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted">Target Audience</p>
          <div class="flex gap-2">
            <UButton v-for="a in audienceOptions" :key="a.value"
              :variant="settings.audience === a.value ? 'solid' : 'outline'"
              :color="settings.audience === a.value ? 'primary' : 'neutral'" :icon="a.icon" size="sm"
              @click="updateSetting('audience', a.value)">
              {{ a.label }}
            </UButton>
          </div>
        </section>

        <div class="border-t border-default" />

        <!-- ── Layout & Style ── -->
        <section>
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Layout & Style</p>
          <div class="grid gap-5 sm:grid-cols-2">

            <!-- Layout type -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Layout type</label>
              <div class="flex gap-2">
                <button v-for="layout in layoutOptions" :key="layout.value" :class="[
                  'flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-medium transition-all',
                  settings.layout === layout.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-default bg-muted/30 text-muted hover:border-primary/40'
                ]" @click="updateSetting('layout', layout.value)">
                  <!-- Mini card illustration -->
                  <div :class="[
                    'rounded bg-current/20 border border-current/30',
                    layout.value === 'vertical' ? 'h-10 w-7' : 'h-7 w-10'
                  ]" />
                  {{ layout.label }}
                </button>
              </div>
            </div>

            <!-- Profile image style -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Profile image style</label>
              <div class="flex gap-2">
                <button v-for="shape in profileShapeOptions" :key="shape.value" :class="[
                  'flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-medium transition-all',
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
        </section>

        <div class="border-t border-default" />

        <!-- ── Colour ── -->
        <section>
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Colour</p>
          <div class="grid gap-4 sm:grid-cols-3">

            <div class="space-y-1.5">
              <label class="text-sm font-medium">Header colour</label>
              <ColorPicker v-model="settings.headerColor" @update:model-value="emitUpdate" />
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium">Footer colour</label>
              <ColorPicker v-model="settings.footerColor" @update:model-value="emitUpdate" />
            </div>

            <div class="space-y-1.5">
              <label class="text-sm font-medium">Header / footer text</label>
              <ColorPicker v-model="settings.headerTextColor" @update:model-value="emitUpdate" />
            </div>

            <div class="space-y-1.5 sm:col-span-3">
              <label class="text-sm font-medium">Primary text colour</label>
              <div class="flex items-center gap-2 sm:w-1/3">
                <ColorPicker v-model="settings.primaryTextColor" @update:model-value="emitUpdate" />
              </div>
            </div>

          </div>
        </section>

        <div class="border-t border-default" />

        <!-- ── Dimensions ── -->
        <section>
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Dimensions (MM)</p>
          <div class="flex items-center gap-4 sm:w-2/3">
            <div class="flex-1 space-y-1.5">
              <label class="text-sm font-medium">Width</label>
              <UInput v-model.number="settings.widthMm" type="number" min="50" max="200" placeholder="85"
                @update:model-value="emitUpdate">
                <template #trailing>
                  <span class="text-xs text-muted">mm</span>
                </template>
              </UInput>
            </div>
            <div class="mt-6 text-muted">×</div>
            <div class="flex-1 space-y-1.5">
              <label class="text-sm font-medium">Height</label>
              <UInput v-model.number="settings.heightMm" type="number" min="50" max="200" placeholder="54"
                @update:model-value="emitUpdate">
                <template #trailing>
                  <span class="text-xs text-muted">mm</span>
                </template>
              </UInput>
            </div>
          </div>
        </section>

        <div class="border-t border-default" />

        <!-- ── Background ── -->
        <section>
          <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Background</p>
          <div class="space-y-4">

            <!-- Background image upload -->
            <div class="space-y-1.5">
              <label class="text-sm font-medium">Background image</label>
              <div
                class="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-default bg-muted/20 px-6 py-5 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
                @click="bgImageInput?.click()" @dragover.prevent @drop.prevent="onBgDrop">
                <input ref="bgImageInput" type="file" accept="image/*" class="hidden" @change="onBgImageChange" />

                <!-- Preview -->
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

            <!-- Opacity slider -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium">Opacity</label>
                <span class="text-sm font-semibold text-primary">{{ settings.bgOpacity }}%</span>
              </div>
              <div class="relative h-5 flex items-center">
                <!-- Track -->
                <div class="absolute inset-x-0 h-1.5 rounded-full overflow-hidden">
                  <div class="h-full bg-muted" />
                  <div class="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
                    :style="{ width: settings.bgOpacity + '%' }" />
                </div>
                <input type="range" v-model.number="settings.bgOpacity" min="0" max="100" step="5"
                  @input="emitUpdate"
                  class="relative w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer" />
              </div>
              <div class="flex justify-between text-[10px] text-muted">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

          </div>
        </section>

        <div class="border-t border-default" />

        <!-- ── Select Fields ── -->
        <section>
          <div class="mb-3 flex items-center justify-between">
            <p class="text-xs font-semibold uppercase tracking-widest text-muted">
              Select fields
              <span class="ml-1 font-normal normal-case">({{ settings.audience === 'student' ? 'Student' : 'Staff'
              }})</span>
            </p>
            <p class="text-[11px] text-muted">Click to toggle visibility</p>
          </div>

          <div class="grid gap-2 sm:grid-cols-2">
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
        </section>

      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <UButton variant="ghost" color="neutral" size="sm" @click="resetSettings">
            Reset to defaults
          </UButton>
          <div class="flex gap-2">
            <UButton variant="outline" color="neutral" size="sm" @click="$emit('close')">
              Cancel
            </UButton>
            <UButton color="primary" size="sm" icon="i-lucide-save" @click="saveSettings">
              Save settings
            </UButton>
          </div>
        </div>
      </template>

    </UCard>
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

const props = defineProps<{
  modelValue: boolean
  settings: Settings
  activeFields: FieldDef[]
  defaultSettings: Settings
}>()

const emit = defineEmits<{
  'update:settings': [Settings]
  'update:activeFields': [FieldDef[]]
  'close': []
  'save': []
}>()

const { success } = useNotify()
const bgImageInput = ref<HTMLInputElement | null>(null)

const audienceOptions = [
  { value: 'student', label: 'Student', icon: 'i-lucide-graduation-cap' },
  { value: 'staff', label: 'Staff', icon: 'i-lucide-briefcase' },
]

const layoutOptions = [
  { value: 'vertical', label: 'Vertical' },
  { value: 'horizontal', label: 'Horizontal' },
]

const profileShapeOptions = [
  { value: 'round', label: 'Round' },
  { value: 'square', label: 'Square' },
]

const settings = ref<Settings>({ ...props.settings })
const activeFields = ref<FieldDef[]>([...props.activeFields])

watch(() => props.settings, (newSettings) => {
  settings.value = { ...newSettings }
}, { deep: true })

watch(() => props.activeFields, (newFields) => {
  activeFields.value = [...newFields]
}, { deep: true })

function updateSetting(key: keyof Settings, value: any) {
  settings.value[key] = value
  emitUpdate()
}

function emitUpdate() {
  emit('update:settings', { ...settings.value })
}

function toggleField(field: FieldDef) {
  const idx = activeFields.value.findIndex(f => f.key === field.key)
  if (idx !== -1) {
    activeFields.value[idx].enabled = !activeFields.value[idx].enabled
    emit('update:activeFields', [...activeFields.value])
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
    settings.value.bgImageUrl = ev.target?.result as string
    emitUpdate()
  }
  reader.readAsDataURL(file)
}

function clearBgImage() {
  settings.value.bgImageUrl = ''
  emitUpdate()
  if (bgImageInput.value) bgImageInput.value.value = ''
}

function resetSettings() {
  settings.value = { ...props.defaultSettings }
  activeFields.value.forEach(f => {
    if (!f.required) f.enabled = true
  })
  emit('update:settings', { ...settings.value })
  emit('update:activeFields', [...activeFields.value])
}

function saveSettings() {
  emit('save')
  success('Settings saved')
}
</script>
