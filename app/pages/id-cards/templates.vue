<template>
  <div class="space-y-6 mt-6 p-4">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 class="text-3xl font-bold">ID Card Templates</h1>
        <p class="mt-2 text-sm text-muted">
          Create and manage ID card designs used throughout the school.
        </p>
      </div>
      <div class="flex gap-3">
        <UButton icon="i-lucide-plus" color="primary" to="/documents/ID Cards/create-template">
          New Template
        </UButton>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid gap-4 md:grid-cols-4">
      <UCard>
        <div class="flex gap-4 items-center">
          <div class="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <UIcon name="i-lucide-layout-template" class="text-primary text-xl" />
          </div>
          <div>
            <p class="text-xs text-muted">Templates</p>
            <h3 class="text-2xl font-bold">6</h3>
          </div>
        </div>
      </UCard>
      <UCard>
        <div class="flex gap-4 items-center">
          <div class="size-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
            <UIcon name="i-lucide-check-circle" class="text-green-600 text-xl" />
          </div>
          <div>
            <p class="text-xs text-muted">Active</p>
            <h3 class="text-2xl font-bold">1</h3>
          </div>
        </div>
      </UCard>
      <UCard>
        <div class="flex gap-4 items-center">
          <div class="size-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
            <UIcon name="i-lucide-star" class="text-yellow-600 text-xl" />
          </div>
          <div>
            <p class="text-xs text-muted">Default</p>
            <h3 class="font-semibold">Modern Blue</h3>
          </div>
        </div>
      </UCard>
      <UCard>
        <div class="flex gap-4 items-center">
          <div class="size-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <UIcon name="i-lucide-copy" class="text-purple-600 text-xl" />
          </div>
          <div>
            <p class="text-xs text-muted">Copies</p>
            <h3 class="text-2xl font-bold">14</h3>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Search -->
    <UCard>
      <div class="grid gap-4 lg:grid-cols-3">
        <UInput icon="i-lucide-search" placeholder="Search templates..." v-model="search" />
        <USelect :items="['All', 'Active', 'Draft']" v-model="filterStatus" placeholder="Status" />
        <USelect :items="['Recent', 'Oldest']" v-model="sortOrder" placeholder="Sort" />
      </div>
    </UCard>

    <!-- Templates grid -->
    <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <UCard
        v-for="tpl in filteredTemplates"
        :key="tpl.id"
        class="overflow-hidden rounded-3xl"
      >

        <!-- Preview area: mini card + flip toggle -->
        <div class="relative h-60 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-default flex items-center justify-center overflow-hidden">

          <!-- Subtle grid background -->
          <div class="absolute inset-0 opacity-30"
            style="background-image: radial-gradient(circle, #cbd5e1 1px, transparent 1px); background-size: 16px 16px;" />

          <!-- Front / Back pill toggle -->
          <div class="absolute top-3 left-3 z-10">
            <div class="flex rounded-lg overflow-hidden border border-white/60 shadow-sm bg-white/80 backdrop-blur-sm">
              <button
                :class="['px-2.5 py-1 text-[10px] font-semibold transition-colors', tpl.previewSide === 'front' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600']"
                @click="tpl.previewSide = 'front'"
              >Front</button>
              <button
                :class="['px-2.5 py-1 text-[10px] font-semibold transition-colors', tpl.previewSide === 'back' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600']"
                @click="tpl.previewSide = 'back'"
              >Back</button>
            </div>
          </div>

          <!-- Layout badge -->
          <div class="absolute top-3 right-3 z-10">
            <span class="rounded-md bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm px-2 py-0.5 text-[10px] font-semibold text-gray-500 capitalize">
              {{ tpl.layout }}
            </span>
          </div>

          <!-- ── VERTICAL FRONT ── -->
          <Transition name="card-fade" mode="out-in">
            <div v-if="tpl.previewSide === 'front' && tpl.layout === 'vertical'" key="vf"
              class="w-[130px] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/8">
              <!-- Header -->
              <div class="px-2 py-2 text-center" :style="{ backgroundColor: tpl.color }">
                <div class="flex flex-col items-center gap-1">
                  <div class="size-6 rounded-lg bg-white/90 flex items-center justify-center shadow-sm">
                    <UIcon name="i-lucide-school" class="size-3.5" :style="{ color: tpl.color }" />
                  </div>
                  <p class="text-[6.5px] font-bold uppercase tracking-wide leading-tight" :style="{ color: tpl.textColor }">
                    King's Way Int'l School
                  </p>
                  <p class="text-[5px] uppercase tracking-widest" :style="{ color: tpl.textColor, opacity: 0.7 }">
                    Student ID Card
                  </p>
                </div>
              </div>
              <!-- Photo -->
              <div class="relative -mt-3 flex justify-center">
                <div :class="['size-9 bg-gray-100 ring-2 ring-white flex items-center justify-center shadow-sm', tpl.profileShape === 'round' ? 'rounded-full' : 'rounded-lg']">
                  <UIcon name="i-lucide-user" class="size-4 text-gray-400" />
                </div>
              </div>
              <!-- Body -->
              <div class="px-2.5 pt-1 pb-2 text-center">
                <p class="text-[7.5px] font-bold text-gray-800">John Kamara</p>
                <p class="text-[6px] text-gray-400">JSS1-A</p>
                <div class="mt-1.5 grid grid-cols-2 gap-1">
                  <div v-for="f in miniFields" :key="f.label" class="rounded bg-gray-50 p-1">
                    <p class="text-[5px] uppercase text-gray-400">{{ f.label }}</p>
                    <p class="text-[6px] font-semibold text-gray-700">{{ f.value }}</p>
                  </div>
                </div>
              </div>
              <!-- Footer -->
              <div class="px-2 py-1 text-center text-[5.5px]" :style="{ backgroundColor: tpl.color, color: tpl.textColor }">
                If found, return to school
              </div>
            </div>

            <!-- ── VERTICAL BACK ── -->
            <div v-else-if="tpl.previewSide === 'back' && tpl.layout === 'vertical'" key="vb"
              class="w-[130px] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/8">
              <div class="px-2 py-2 text-center" :style="{ backgroundColor: tpl.color }">
                <p class="text-[7px] font-bold uppercase tracking-widest" :style="{ color: tpl.textColor }">
                  Important Info
                </p>
              </div>
              <div class="p-2.5 space-y-2">
                <div class="rounded-lg bg-gray-50 p-2">
                  <div class="flex justify-center mb-1">
                    <div class="size-5 rounded-md flex items-center justify-center" :style="{ backgroundColor: tpl.color + '20' }">
                      <UIcon name="i-lucide-shield-check" class="size-3" :style="{ color: tpl.color }" />
                    </div>
                  </div>
                  <p class="text-center text-[5.5px] leading-relaxed text-gray-500">
                    This card is property of <strong>King's Way Int'l School</strong>. Report loss immediately.
                  </p>
                </div>
                <div class="grid grid-cols-2 gap-1">
                  <div class="rounded bg-gray-50 p-1">
                    <p class="text-[5px] text-gray-400">Parent</p>
                    <p class="text-[6px] font-semibold text-gray-700">+232 76 123 456</p>
                  </div>
                  <div class="rounded bg-gray-50 p-1">
                    <p class="text-[5px] text-gray-400">Emergency</p>
                    <p class="text-[6px] font-semibold text-gray-700">+232 76 123 456</p>
                  </div>
                </div>
                <div class="flex justify-center pt-0.5">
                  <UIcon name="i-lucide-qr-code" class="text-2xl text-gray-600" />
                </div>
              </div>
              <div class="px-2 py-1 text-center text-[5.5px]" :style="{ backgroundColor: tpl.color, color: tpl.textColor }">
                Powered by Skultem SMS
              </div>
            </div>

            <!-- ── HORIZONTAL FRONT ── -->
            <div v-else-if="tpl.previewSide === 'front' && tpl.layout === 'horizontal'" key="hf"
              class="w-[190px] overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/8">
              <div class="flex">
                <!-- Left column -->
                <div class="w-14 shrink-0 flex flex-col items-center justify-center gap-1.5 px-1.5 py-3"
                  :style="{ backgroundColor: tpl.color }">
                  <div class="size-6 rounded-lg bg-white/90 flex items-center justify-center shadow-sm">
                    <UIcon name="i-lucide-school" class="size-3.5" :style="{ color: tpl.color }" />
                  </div>
                  <p class="text-center text-[5px] font-bold uppercase leading-tight tracking-wide" :style="{ color: tpl.textColor }">
                    King's Way Int'l School
                  </p>
                  <p class="text-[4.5px] uppercase tracking-widest text-center" :style="{ color: tpl.textColor, opacity: 0.7 }">
                    Student ID
                  </p>
                </div>
                <!-- Right body -->
                <div class="flex flex-col flex-1">
                  <div class="flex items-center gap-1.5 px-2 pt-2">
                    <div :class="['size-8 shrink-0 bg-gray-100 ring-1 ring-white flex items-center justify-center', tpl.profileShape === 'round' ? 'rounded-full' : 'rounded-lg']">
                      <UIcon name="i-lucide-user" class="size-3.5 text-gray-400" />
                    </div>
                    <div>
                      <p class="text-[7px] font-bold text-gray-800">John Kamara</p>
                      <p class="text-[5.5px] text-gray-400">JSS1-A</p>
                    </div>
                  </div>
                  <div class="mt-1.5 grid grid-cols-2 gap-1 px-2">
                    <div v-for="f in miniFields" :key="f.label" class="rounded bg-gray-50 p-1">
                      <p class="text-[5px] uppercase text-gray-400">{{ f.label }}</p>
                      <p class="text-[6px] font-semibold text-gray-700">{{ f.value }}</p>
                    </div>
                  </div>
                  <div class="mt-auto px-2 py-1 text-[5.5px]" :style="{ backgroundColor: tpl.color, color: tpl.textColor }">
                    If found, return to school
                  </div>
                </div>
              </div>
            </div>

            <!-- ── HORIZONTAL BACK ── -->
            <div v-else-if="tpl.previewSide === 'back' && tpl.layout === 'horizontal'" key="hb"
              class="w-[190px] overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/8">
              <div class="flex">
                <!-- Left column -->
                <div class="w-14 shrink-0 flex flex-col items-center justify-center gap-1.5 px-1.5 py-3"
                  :style="{ backgroundColor: tpl.color }">
                  <div class="size-6 rounded-lg bg-white/15 flex items-center justify-center">
                    <UIcon name="i-lucide-shield-check" class="size-3.5" :style="{ color: tpl.textColor }" />
                  </div>
                  <p class="text-center text-[5px] font-bold uppercase leading-tight" :style="{ color: tpl.textColor }">
                    Important Info
                  </p>
                </div>
                <!-- Right body -->
                <div class="flex flex-col flex-1">
                  <div class="flex-1 p-2 space-y-1.5">
                    <p class="text-[5.5px] leading-relaxed text-gray-500">
                      This card is property of <strong>King's Way Int'l School</strong>. Report loss immediately.
                    </p>
                    <div class="grid grid-cols-2 gap-1">
                      <div class="rounded bg-gray-50 p-1">
                        <p class="text-[5px] text-gray-400">Parent</p>
                        <p class="text-[6px] font-semibold">+232 76 123 456</p>
                      </div>
                      <div class="rounded bg-gray-50 p-1">
                        <p class="text-[5px] text-gray-400">Emergency</p>
                        <p class="text-[6px] font-semibold">+232 76 123 456</p>
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between px-2 py-1" :style="{ backgroundColor: tpl.color }">
                    <p class="text-[5px]" :style="{ color: tpl.textColor }">Skultem SMS</p>
                    <UIcon name="i-lucide-qr-code" class="text-sm" :style="{ color: tpl.textColor }" />
                  </div>
                </div>
              </div>
            </div>
          </Transition>

        </div>

        <!-- Card body -->
        <div class="mt-5">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold">{{ tpl.name }}</h3>
            <UBadge :color="tpl.active ? 'success' : 'neutral'" variant="soft">
              {{ tpl.active ? 'Active' : 'Draft' }}
            </UBadge>
          </div>
          <p class="text-sm text-muted mt-2">{{ tpl.description }}</p>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex flex-wrap gap-2">
          <UButton size="sm" icon="i-lucide-eye" variant="soft" :to="`/id-cards/${tpl.id}`">
            Preview
          </UButton>
          <UButton size="sm" icon="i-lucide-pencil" variant="outline" :to="`/id-cards/${tpl.id}/edit`">
            Edit
          </UButton>
          <UButton size="sm" icon="i-lucide-copy" variant="outline">
            Duplicate
          </UButton>
          <UButton v-if="!tpl.active" size="sm" icon="i-lucide-check" color="success">
            Set Default
          </UButton>
        </div>

      </UCard>
    </div>

  </div>
</template>

<script setup lang="ts">
interface Template {
  id: number
  name: string
  description: string
  active: boolean
  color: string
  textColor: string
  layout: 'vertical' | 'horizontal'
  profileShape: 'round' | 'square'
  previewSide: 'front' | 'back'
}

const search = ref('')
const filterStatus = ref('All')
const sortOrder = ref('Recent')

const templates = ref<Template[]>([
  {
    id: 1,
    name: 'Modern Blue',
    description: 'Modern ID card with blue accents.',
    active: true,
    color: '#2563eb',
    textColor: '#ffffff',
    layout: 'vertical',
    profileShape: 'square',
    previewSide: 'front',
  },
  {
    id: 2,
    name: 'Classic Green',
    description: 'Simple traditional card design.',
    active: false,
    color: '#15803d',
    textColor: '#ffffff',
    layout: 'vertical',
    profileShape: 'round',
    previewSide: 'front',
  },
  {
    id: 3,
    name: 'Minimal White',
    description: 'Clean and elegant layout.',
    active: false,
    color: '#374151',
    textColor: '#ffffff',
    layout: 'horizontal',
    profileShape: 'square',
    previewSide: 'front',
  },
  {
    id: 4,
    name: 'International',
    description: 'Suitable for international schools.',
    active: false,
    color: '#b45309',
    textColor: '#ffffff',
    layout: 'horizontal',
    profileShape: 'round',
    previewSide: 'front',
  },
  {
    id: 5,
    name: 'Dark Theme',
    description: 'Modern dark card design.',
    active: false,
    color: '#1e1b4b',
    textColor: '#e0e7ff',
    layout: 'vertical',
    profileShape: 'round',
    previewSide: 'front',
  },
  {
    id: 6,
    name: 'Primary School',
    description: 'Colorful template for primary schools.',
    active: false,
    color: '#be185d',
    textColor: '#ffffff',
    layout: 'horizontal',
    profileShape: 'round',
    previewSide: 'front',
  },
])

const miniFields = [
  { label: 'Gender', value: 'Male' },
  { label: 'Adm. No', value: 'KWIS001' },
  { label: 'DOB', value: '12 Mar 2011' },
  { label: 'Valid', value: 'Jun 2027' },
]

const filteredTemplates = computed(() => {
  let list = templates.value

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
  }

  if (filterStatus.value === 'Active') list = list.filter(t => t.active)
  if (filterStatus.value === 'Draft')  list = list.filter(t => !t.active)

  if (sortOrder.value === 'Oldest') list = [...list].reverse()

  return list
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>

<style scoped>
.card-fade-enter-active,
.card-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.card-fade-enter-from,
.card-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>