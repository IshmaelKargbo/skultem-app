<template>
  <div class="space-y-3">
    <div v-if="loading" class="space-y-3"><USkeleton v-for="i in 5" :key="i" class="h-14 w-full" /></div>

    <UAlert v-else-if="failure" color="warning" variant="soft" icon="i-lucide-cloud-off" :title="failure">
      <template #actions><UButton size="xs" variant="outline" color="warning" label="Try again" @click="load" /></template>
    </UAlert>

    <template v-else-if="editor">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <p class="font-semibold text-highlighted">{{ editor.templateName }}</p>
          <p class="text-xs text-muted">
            {{ editor.placeholders.length }} placeholders ·
            {{ linkedCount }} linked by you · {{ blankCount }} will print blank
          </p>
        </div>
        <div class="flex gap-2">
          <UButton variant="ghost" color="neutral" icon="i-lucide-rotate-ccw" label="All automatic"
            :disabled="saving" @click="resetAll" />
          <UButton icon="i-lucide-save" label="Save links" :loading="saving" :disabled="!dirty" @click="save" />
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <!-- The design's placeholders -->
        <div class="space-y-2">
          <div v-for="p in editor.placeholders" :key="p.name" class="rounded-lg border p-3"
            :class="willBeBlank(p) ? 'border-warning/50 bg-warning/5' : 'border-default'">
            <div class="flex flex-col gap-2 md:flex-row md:items-start">
              <div class="min-w-0 md:w-48">
                <p class="font-mono text-sm text-highlighted">{{ tag(p.name) }}</p>
                <UBadge size="sm" variant="soft" color="neutral" :label="typeLabel(p.type)" class="mt-1" />
              </div>
              <div class="min-w-0 flex-1 space-y-2">
                <USelectMenu :model-value="state[p.name]!.choice" :items="choicesFor(p)" value-key="value"
                  label-key="label" class="w-full" :search-input="{ placeholder: 'Search Skultem data...' }"
                  :aria-label="`Data for ${p.name}`" @update:model-value="setChoice(state[p.name]!, $event)" />
                <!-- Typing here prints exactly this instead of Skultem's data; clearing it goes back to the data. -->
                <UInput v-if="p.type === 'TEXT'" :model-value="state[p.name]!.text" class="w-full"
                  icon="i-lucide-pencil-line" placeholder="Or type what to print here (optional)"
                  :color="state[p.name]!.choice === TEXT ? 'primary' : 'neutral'" :highlight="state[p.name]!.choice === TEXT"
                  :aria-label="`Your own text for ${p.name}`" @update:model-value="setText(state[p.name]!, $event)">
                  <template v-if="state[p.name]!.text" #trailing>
                    <UButton size="xs" variant="link" color="neutral" icon="i-lucide-x" aria-label="Clear the text"
                      @click="setText(state[p.name]!, '')" />
                  </template>
                </UInput>
                <p class="text-xs text-muted">{{ preview(p) }}</p>

                <!-- A list's columns -->
                <div v-if="p.type === 'LIST' && listSource(p) && p.columns.length"
                  class="space-y-2 rounded-md bg-elevated p-2">
                  <p class="text-xs font-medium text-toned">Columns of each row</p>
                  <div v-for="col in p.columns" :key="col" class="grid items-center gap-2 sm:grid-cols-[9rem_1fr]">
                    <span class="font-mono text-xs text-highlighted">{{ col }}</span>
                    <div class="flex flex-col gap-2 sm:flex-row">
                      <USelectMenu :model-value="state[p.name]!.columns[col]!.choice" :items="columnChoices(p, col)"
                        value-key="value" label-key="label" size="sm" class="min-w-0 flex-1"
                        :aria-label="`Data for column ${col}`"
                        @update:model-value="setChoice(state[p.name]!.columns[col]!, $event)" />
                      <UInput :model-value="state[p.name]!.columns[col]!.text" size="sm" class="sm:w-40"
                        placeholder="Or type text" :highlight="state[p.name]!.columns[col]!.choice === TEXT"
                        :aria-label="`Your own text for column ${col}`"
                        @update:model-value="setText(state[p.name]!.columns[col]!, $event)" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p v-if="!editor.placeholders.length" class="text-sm text-muted">This design has no placeholders to fill.</p>
        </div>

        <!-- Everything Skultem has -->
        <div class="space-y-2 lg:sticky lg:top-4 lg:self-start">
          <p class="text-sm font-semibold text-highlighted">Skultem data you can use</p>
          <div class="max-h-[70vh] space-y-3 overflow-y-auto rounded-lg border border-default p-3">
            <div v-for="group in groups" :key="group.name">
              <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">{{ group.name }}</p>
              <ul class="space-y-1">
                <li v-for="s in group.items" :key="s.key" class="text-xs">
                  <span class="font-medium text-highlighted">{{ s.label }}</span>
                  <span v-if="s.type !== 'TEXT'" class="text-muted"> · {{ typeLabel(s.type) }}</span>
                  <span v-if="s.type === 'TEXT' && s.example" class="block truncate text-muted">e.g. {{ s.example }}</span>
                  <span v-if="s.type === 'LIST'" class="block text-muted">
                    Columns: {{ s.columns.map(c => c.label).join(', ') }}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
// Links each placeholder of a design to Skultem's data, fixed text or nothing, for one kind of document.
const props = defineProps<{ kind: DocumentDesignKind, template?: string | null }>()
const emit = defineEmits<{ loaded: [editor: FieldLinkEditor] }>()
const { success, error: toastError } = useNotify()

const AUTO = '__auto'
const BLANK = '__blank'
const TEXT = '__text'

// prev: the data choice to go back to when typed text is cleared.
type ColumnState = { choice: string, text: string, prev: string }
type PlaceholderState = { choice: string, text: string, prev: string, columns: Record<string, ColumnState> }

// Typed text wins over the data; clearing it returns to the data that was chosen before.
function setText(s: ColumnState, value: string | number | null | undefined) {
  const text = String(value ?? '')
  s.text = text
  if (text.trim()) {
    if (s.choice !== TEXT) {
      s.prev = s.choice
      s.choice = TEXT
    }
  } else if (s.choice === TEXT) {
    s.choice = s.prev || AUTO
  }
}

// Picking data (or blank) from the list drops any typed text.
function setChoice(s: ColumnState, value: string) {
  s.choice = value
  if (value !== TEXT) {
    s.text = ''
    s.prev = value
  }
}

const editor = ref<FieldLinkEditor>()
const loading = ref(true)
const failure = ref<string | null>(null)
const saving = ref(false)
const state = reactive<Record<string, PlaceholderState>>({})
const savedFingerprint = ref('')

const sourcesByKey = computed(() => new Map((editor.value?.sources ?? []).map(s => [s.key, s])))
const groups = computed(() => {
  const out: { name: string, items: DataSource[] }[] = []
  for (const s of editor.value?.sources ?? []) {
    let g = out.find(x => x.name === s.group)
    if (!g) out.push(g = { name: s.group, items: [] })
    g.items.push(s)
  }
  return out
})

function tag(name: string) {
  return '{' + '{' + name + '}' + '}'
}

function typeLabel(type: string) {
  return type === 'IMAGE' ? 'Picture' : type === 'LIST' ? 'List' : 'Text'
}

function choicesFor(p: DesignPlaceholder) {
  const auto = p.automatic ? sourcesByKey.value.get(p.automatic) : null
  const items: { label: string, value: string }[] = [
    { label: auto ? `Automatic: ${auto.label}` : 'Automatic: nothing matches - prints blank', value: AUTO }
  ]
  if (p.type === 'TEXT') items.push({ label: 'My own text (typed below)', value: TEXT })
  if (p.type !== 'IMAGE') items.push({ label: 'Leave blank', value: BLANK })
  for (const s of editor.value?.sources ?? []) {
    if (s.type === p.type) items.push({ label: `${s.group} · ${s.label}`, value: s.key })
  }
  return items
}

// The Skultem list a list placeholder takes its rows from (its link, else the automatic one).
function listSource(p: DesignPlaceholder): DataSource | null {
  const c = state[p.name]?.choice
  const key = c === AUTO ? p.automatic : c && c !== BLANK && c !== TEXT ? c : null
  return key ? sourcesByKey.value.get(key) ?? null : null
}

function columnChoices(p: DesignPlaceholder, col: string) {
  const list = listSource(p)
  const autoKey = list ? p.automaticColumns[list.key]?.[col] : null
  const auto = autoKey ? list?.columns.find(c => c.key === autoKey) : null
  return [
    { label: auto ? `Automatic: ${auto.label}` : 'Automatic: nothing matches - blank', value: AUTO },
    { label: 'My own text (typed beside)', value: TEXT },
    { label: 'Leave blank', value: BLANK },
    ...(list?.columns ?? []).map(c => ({ label: c.label, value: c.key }))
  ]
}

function willBeBlank(p: DesignPlaceholder) {
  const c = state[p.name]?.choice
  return c === BLANK || (c === AUTO && !p.automatic) || (c === TEXT && !state[p.name]?.text.trim())
}

const linkedCount = computed(() => Object.values(state).filter(s => s.choice !== AUTO).length)
const blankCount = computed(() => (editor.value?.placeholders ?? []).filter(willBeBlank).length)

function preview(p: DesignPlaceholder) {
  const c = state[p.name]?.choice
  if (c === TEXT) return state[p.name]!.text ? `Prints your text: "${state[p.name]!.text}"` : 'Type the text to print below'
  if (c === BLANK) return 'Prints nothing'
  const key = c === AUTO ? p.automatic : c
  const s = key ? sourcesByKey.value.get(key) : null
  if (!s) return 'Nothing in Skultem matches this name, so it prints blank - pick the data for it.'
  if (s.type === 'IMAGE') return `Prints the ${s.label.toLowerCase()}`
  if (s.type === 'LIST') return `One row per item of ${s.label.toLowerCase()}`
  return s.example ? `Prints e.g. "${s.example}"` : `Prints the ${s.label.toLowerCase()}`
}

// ---- Loading and saving

function take(next: FieldLinkEditor) {
  editor.value = next
  for (const key of Object.keys(state)) delete state[key]
  for (const p of next.placeholders) {
    const link = p.link
    const s: PlaceholderState = { choice: AUTO, text: '', prev: AUTO, columns: {} }
    if (link?.text != null) {
      s.choice = TEXT
      s.text = link.text
    } else if (link?.source === '') {
      s.choice = BLANK
    } else if (link?.source) {
      s.choice = link.source
    }
    for (const col of p.columns) {
      const v = link?.columns?.[col]
      s.columns[col] = v == null ? { choice: AUTO, text: '', prev: AUTO }
        : v === '' ? { choice: BLANK, text: '', prev: BLANK }
          : v.startsWith('text:') ? { choice: TEXT, text: v.slice(5), prev: AUTO }
            : { choice: v, text: '', prev: v }
    }
    if (s.choice !== TEXT) s.prev = s.choice
    state[p.name] = s
  }
  savedFingerprint.value = JSON.stringify(links())
  emit('loaded', next)
}

function links(): Record<string, FieldLink> {
  const out: Record<string, FieldLink> = {}
  for (const p of editor.value?.placeholders ?? []) {
    const s = state[p.name]
    if (!s) continue
    const columns: Record<string, string> = {}
    for (const [col, cs] of Object.entries(s.columns)) {
      if (cs.choice === AUTO) continue
      columns[col] = cs.choice === TEXT ? `text:${cs.text}` : cs.choice === BLANK ? '' : cs.choice
    }
    if (s.choice === TEXT) out[p.name] = { text: s.text }
    else if (s.choice === BLANK) out[p.name] = { source: '' }
    else if (s.choice !== AUTO) out[p.name] = { source: s.choice, columns: Object.keys(columns).length ? columns : null }
    else if (Object.keys(columns).length && p.automatic) out[p.name] = { source: p.automatic, columns }
  }
  return out
}

const dirty = computed(() => !!editor.value && JSON.stringify(links()) !== savedFingerprint.value)

async function load() {
  loading.value = true
  failure.value = null
  try {
    take(await DocumentDesignApi().fields(props.kind, props.template))
  } catch (err: any) {
    failure.value = err?.message || 'The design could not be read'
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!editor.value) return
  saving.value = true
  try {
    take(await DocumentDesignApi().saveFields(props.kind, editor.value.template, links()))
    success('Data links saved - documents print with them from now on')
  } catch (err: any) {
    toastError(err?.message || 'The links could not be saved')
  } finally {
    saving.value = false
  }
}

function resetAll() {
  for (const s of Object.values(state)) {
    s.choice = AUTO
    s.text = ''
    s.prev = AUTO
    for (const c of Object.values(s.columns)) {
      c.choice = AUTO
      c.text = ''
      c.prev = AUTO
    }
  }
}

watch(() => [props.kind, props.template], load)
onMounted(load)
defineExpose({ dirty })
</script>
