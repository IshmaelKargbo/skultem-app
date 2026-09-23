<script setup lang="ts">
// Picks which playground data to clear and confirms going live - shared by the school's own
// Settings > Playground tab and the system admin's "Take Live" modal, which only differ in the
// endpoint they submit to (see PlaygroundApi().goLive / SystemApi().moveToProduction).
const props = defineProps<{
  summary: PlaygroundSummary
  submitting?: boolean
  // For roles that can see what's there but can't go live.
  readonly?: boolean
}>()

const emit = defineEmits<{
  submit: [GoLivePayload]
}>()

const categories = computed(() =>
  PLAYGROUND_CATEGORY_ORDER
    .map(key => props.summary.categories.find(c => c.key === key))
    .filter((c): c is PlaygroundCategory => !!c)
)
const isSetup = (c: PlaygroundCategory) => !!PLAYGROUND_CATEGORY_META[c.key].setup
const dataCategories = computed(() => categories.value.filter(c => !isSetup(c)))
const setupCategories = computed(() => categories.value.filter(isSetup))

const totalOf = (c: PlaygroundCategory) => Object.values(c.counts).reduce((a, b) => a + b, 0)

// What the user ticked themselves, vs. what that pulls in (see requires) - a category that's only
// included because of another one shows as ticked and locked, with the reason.
const chosen = ref<Set<PlaygroundCategoryKey>>(new Set())

// Declared before the immediate watcher below, which resets it - referencing it any later threw
// "Cannot access 'confirmation' before initialization" and left the whole panel blank.
const confirmation = ref('')
const confirmed = computed(() => confirmation.value.trim().toLowerCase() === props.summary.domain.toLowerCase())

watch(() => props.summary, (summary) => {
  // Default to a clean slate of test records - everything that has data in it, but never setup.
  chosen.value = new Set(summary.categories
    .filter(c => totalOf(c) > 0 && !PLAYGROUND_CATEGORY_META[c.key].setup)
    .map(c => c.key))
  confirmation.value = ''
}, { immediate: true })

const included = computed(() => {
  const result = new Set<PlaygroundCategoryKey>()
  const pending = [...chosen.value]
  while (pending.length) {
    const key = pending.pop()!
    if (result.has(key)) continue
    result.add(key)
    pending.push(...(props.summary.categories.find(c => c.key === key)?.requires ?? []))
  }
  return result
})

function requiredBy(key: PlaygroundCategoryKey) {
  return categories.value.find(c => chosen.value.has(c.key) && c.key !== key && c.requires.includes(key))
}

function toggle(key: PlaygroundCategoryKey, value: boolean | 'indeterminate') {
  const next = new Set(chosen.value)
  if (value === true) next.add(key)
  else next.delete(key)
  chosen.value = next
}

// Test records only - setup is opted into one box at a time. Keeps any setup already ticked.
function selectAll() {
  chosen.value = new Set([...chosen.value, ...dataCategories.value.map(c => c.key)])
}

function selectNone() {
  chosen.value = new Set()
}

const hasAnyData = computed(() => categories.value.some(c => totalOf(c) > 0))
const clearingSetup = computed(() => setupCategories.value.some(c => included.value.has(c.key)))

const recordsToClear = computed(() =>
  categories.value.filter(c => included.value.has(c.key)).reduce((sum, c) => sum + totalOf(c), 0)
)


function submit() {
  if (!confirmed.value || props.readonly) return
  emit('submit', { categories: [...included.value], confirmation: confirmation.value.trim() })
}
</script>

<template>
  <div class="space-y-5">
    <!-- Go live - first, so it's the first thing anyone opening this section sees. -->
    <section class="rounded-xl border p-4 sm:p-5"
      :class="included.size ? 'border-error/30 bg-error/5' : 'border-primary/30 bg-primary/5'">
      <div class="flex items-start gap-3">
        <div class="flex size-10 shrink-0 items-center justify-center rounded-xl"
          :class="included.size ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'">
          <UIcon name="i-lucide-rocket" class="size-5" />
        </div>
        <div class="min-w-0 flex-1 space-y-1">
          <p class="font-semibold text-highlighted">Ready to go live?</p>
          <p class="text-sm text-toned">
            <template v-if="included.size">
              {{ recordsToClear }} test record{{ recordsToClear === 1 ? '' : 's' }} from
              {{ included.size }} group{{ included.size === 1 ? '' : 's' }} below will be permanently removed.
            </template>
            <template v-else-if="!hasAnyData">
              There's no test data yet - going live just switches playground mode off.
            </template>
            <template v-else>
              Nothing is ticked below, so every record is kept as real data.
            </template>
          </p>
          <p v-if="clearingSetup" class="text-xs font-medium text-error">
            This includes school setup you'll need to recreate before enrolling students.
          </p>
          <p class="text-xs text-muted">
            Always kept: subjects, academic years, fee categories, staff, materials and branding.
          </p>
        </div>
      </div>

      <UAlert v-if="readonly" class="mt-4" color="neutral" variant="subtle" icon="i-lucide-lock"
        title="Only the owner, a proprietor or a super admin can take the school live." />

      <div v-else class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <UFormField class="flex-1" :label="`Type ${summary.domain} to confirm`">
          <UInput v-model="confirmation" :placeholder="summary.domain" class="w-full" autocomplete="off"
            :disabled="submitting" @keyup.enter="submit" />
        </UFormField>
        <UButton :color="included.size ? 'error' : 'primary'" icon="i-lucide-rocket" :loading="submitting"
          :disabled="!confirmed" class="justify-center"
          :label="included.size ? 'Clear selected data & go live' : 'Go live now'" @click="submit" />
      </div>
    </section>

    <!-- What to clear -->
    <section class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p class="text-sm font-semibold text-highlighted">Choose what to clear</p>
          <p class="text-xs text-muted">Tick what was only for testing. Anything left unticked is kept as real data.</p>
        </div>
        <div v-if="!readonly" class="flex gap-2">
          <UButton size="xs" variant="ghost" color="neutral" label="Select all" @click="selectAll" />
          <UButton size="xs" variant="ghost" color="neutral" label="Keep all" @click="selectNone" />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
        <label v-for="category in dataCategories" :key="category.key"
          class="flex gap-3 rounded-xl border p-3 transition-colors"
          :class="[
            included.has(category.key) ? 'border-error/40 bg-error/5' : 'border-default',
            readonly || requiredBy(category.key) ? 'cursor-default' : 'cursor-pointer hover:bg-muted/40'
          ]">
          <UCheckbox :model-value="included.has(category.key)" color="error" class="mt-0.5"
            :disabled="readonly || !!requiredBy(category.key)"
            @update:model-value="(v) => toggle(category.key, v)" />

          <div class="min-w-0 flex-1 space-y-1">
            <div class="flex items-center gap-2">
              <UIcon :name="PLAYGROUND_CATEGORY_META[category.key].icon" class="size-4 shrink-0 text-muted" />
              <p class="text-sm font-medium text-highlighted">{{ PLAYGROUND_CATEGORY_META[category.key].label }}</p>
            </div>
            <p class="text-xs text-muted">{{ PLAYGROUND_CATEGORY_META[category.key].description }}</p>
            <div class="flex flex-wrap gap-1 pt-0.5">
              <UBadge v-for="(count, label) in category.counts" :key="label" size="sm" variant="subtle"
                color="neutral" :class="count > 0 ? '' : 'opacity-60'">
                {{ count }} {{ label }}
              </UBadge>
            </div>
            <p v-if="requiredBy(category.key)" class="text-xs text-error">
              Cleared along with {{ PLAYGROUND_CATEGORY_META[requiredBy(category.key)!.key].label.toLowerCase() }}
            </p>
          </div>
        </label>
      </div>

      <div v-if="setupCategories.length" class="space-y-2 pt-2">
        <div>
          <p class="text-sm font-semibold text-highlighted">Setup <span class="font-normal text-muted">(optional)</span></p>
          <p class="text-xs text-muted">
            Only tick these if you want to rebuild your class or subject setup from scratch.
          </p>
        </div>
        <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
          <label v-for="category in setupCategories" :key="category.key"
            class="flex gap-3 rounded-xl border p-3 transition-colors"
            :class="[
              included.has(category.key) ? 'border-error/40 bg-error/5' : 'border-default',
              readonly || requiredBy(category.key) ? 'cursor-default' : 'cursor-pointer hover:bg-muted/40'
            ]">
            <UCheckbox :model-value="included.has(category.key)" color="error" class="mt-0.5"
              :disabled="readonly || !!requiredBy(category.key)"
              @update:model-value="(v) => toggle(category.key, v)" />

            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex items-center gap-2">
                <UIcon :name="PLAYGROUND_CATEGORY_META[category.key].icon" class="size-4 shrink-0 text-muted" />
                <p class="text-sm font-medium text-highlighted">{{ PLAYGROUND_CATEGORY_META[category.key].label }}</p>
              </div>
              <p class="text-xs text-muted">{{ PLAYGROUND_CATEGORY_META[category.key].description }}</p>
              <div class="flex flex-wrap gap-1 pt-0.5">
                <UBadge v-for="(count, label) in category.counts" :key="label" size="sm" variant="subtle"
                  color="neutral" :class="count > 0 ? '' : 'opacity-60'">
                  {{ count }} {{ label }}
                </UBadge>
              </div>
              <p v-if="requiredBy(category.key)" class="text-xs text-error">
                Cleared along with {{ PLAYGROUND_CATEGORY_META[requiredBy(category.key)!.key].label.toLowerCase() }}
              </p>
            </div>
          </label>
        </div>
      </div>
    </section>
  </div>
</template>
