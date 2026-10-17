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
  <div class="space-y-6">
    <!-- Summary: what going live will do -->
    <section class="overflow-hidden rounded-2xl border"
      :class="included.size ? 'border-error/30' : 'border-primary/30'">
      <div class="flex items-start gap-4 p-4 sm:p-5"
        :class="included.size ? 'bg-error/5' : 'bg-primary/5'">
        <div class="flex size-11 shrink-0 items-center justify-center rounded-2xl"
          :class="included.size ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'">
          <UIcon name="i-lucide-rocket" class="size-5" />
        </div>
        <div class="min-w-0 flex-1 space-y-1">
          <p class="text-base font-semibold text-highlighted">Ready to go live?</p>
          <p class="text-sm text-toned">
            <template v-if="included.size">
              <span class="font-semibold text-error">{{ recordsToClear }} test record{{ recordsToClear === 1 ? '' : 's' }}</span>
              across {{ included.size }} group{{ included.size === 1 ? '' : 's' }} will be permanently removed.
            </template>
            <template v-else-if="!hasAnyData">
              There's no test data yet - going live just switches playground mode off.
            </template>
            <template v-else>
              Nothing is selected, so every record is kept as real data.
            </template>
          </p>
          <p v-if="clearingSetup" class="flex items-center gap-1 text-xs font-medium text-error">
            <UIcon name="i-lucide-triangle-alert" class="size-3.5" />
            Includes school setup you'll need to recreate before enrolling students.
          </p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-default bg-default px-4 py-2.5 text-xs text-muted sm:px-5">
        <UIcon name="i-lucide-shield-check" class="size-3.5 text-success" />
        <span class="font-medium text-toned">Always kept:</span>
        <span>subjects, academic years, fee categories, staff, materials and branding</span>
      </div>
    </section>

    <!-- What to clear -->
    <section v-for="group in [
      { id: 'data', title: 'Test records', hint: 'Tick what was only for testing. Anything unticked is kept as real data.', items: dataCategories, tools: true },
      { id: 'setup', title: 'School setup', hint: 'Optional - only tick these to rebuild your classes or subjects from scratch.', items: setupCategories, tools: false },
    ].filter(g => g.items.length)" :key="group.id" class="space-y-3">
      <div class="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p class="text-sm font-semibold text-highlighted">{{ group.title }}</p>
          <p class="text-xs text-muted">{{ group.hint }}</p>
        </div>
        <div v-if="group.tools && !readonly" class="flex gap-1">
          <UButton size="xs" variant="soft" color="neutral" label="Select all" @click="selectAll" />
          <UButton size="xs" variant="ghost" color="neutral" label="Keep all" @click="selectNone" />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label v-for="category in group.items" :key="category.key"
          class="group relative flex gap-3 rounded-2xl border p-4 transition-all"
          :class="[
            included.has(category.key) ? 'border-error/40 bg-error/5 shadow-sm' : 'border-default bg-default',
            readonly || requiredBy(category.key) ? 'cursor-default' : 'cursor-pointer hover:border-accented hover:shadow-sm'
          ]">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors"
            :class="included.has(category.key) ? 'bg-error/10 text-error' : 'bg-elevated text-muted'">
            <UIcon :name="PLAYGROUND_CATEGORY_META[category.key].icon" class="size-5" />
          </div>

          <div class="min-w-0 flex-1 space-y-2">
            <div>
              <p class="text-sm font-semibold text-highlighted">{{ PLAYGROUND_CATEGORY_META[category.key].label }}</p>
              <p class="text-xs text-muted">{{ PLAYGROUND_CATEGORY_META[category.key].description }}</p>
            </div>
            <div class="flex flex-wrap gap-1">
              <UBadge v-for="(count, label) in category.counts" :key="label" size="sm" variant="subtle"
                :color="count > 0 ? 'neutral' : 'neutral'" :class="count > 0 ? '' : 'opacity-50'">
                <span class="font-semibold">{{ count }}</span>&nbsp;{{ label }}
              </UBadge>
            </div>
            <p v-if="requiredBy(category.key)" class="flex items-center gap-1 text-xs text-error">
              <UIcon name="i-lucide-link" class="size-3" />
              Cleared along with {{ PLAYGROUND_CATEGORY_META[requiredBy(category.key)!.key].label.toLowerCase() }}
            </p>
          </div>

          <UCheckbox :model-value="included.has(category.key)" color="error"
            :disabled="readonly || !!requiredBy(category.key)"
            @update:model-value="(v) => toggle(category.key, v)" />
        </label>
      </div>
    </section>

    <!-- Confirm -->
    <section class="rounded-2xl border border-default bg-elevated/40 p-4 sm:p-5">
      <UAlert v-if="readonly" color="neutral" variant="subtle" icon="i-lucide-lock"
        title="Only the owner, a proprietor or a super admin can take the school live." />

      <div v-else class="space-y-3">
        <div>
          <p class="text-sm font-semibold text-highlighted">Confirm</p>
          <p class="text-xs text-muted">This can't be undone. Type the school's domain to continue.</p>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
          <UFormField class="flex-1" :label="`Type ${summary.domain} to confirm`">
            <UInput v-model="confirmation" :placeholder="summary.domain" class="w-full" size="lg"
              autocomplete="off" :disabled="submitting" @keyup.enter="submit" />
          </UFormField>
          <UButton size="lg" :color="included.size ? 'error' : 'primary'" icon="i-lucide-rocket"
            :loading="submitting" :disabled="!confirmed" class="justify-center"
            :label="included.size ? 'Clear selected data & go live' : 'Go live now'" @click="submit" />
        </div>
      </div>
    </section>
  </div>
</template>
