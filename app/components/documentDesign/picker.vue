<template>
  <div class="space-y-3">
    <div v-if="loading" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <USkeleton v-for="i in 3" :key="i" class="aspect-[3/4] w-full rounded-lg" />
    </div>

    <UAlert v-else-if="failure" color="warning" variant="soft" icon="i-lucide-cloud-off" :title="failure"
      description="The designs come from the document service. Try again in a moment.">
      <template #actions><UButton size="xs" variant="outline" color="warning" label="Try again" @click="load" /></template>
    </UAlert>

    <template v-else-if="choice">
      <p class="text-sm text-muted">
        <template v-if="currentOption">
          Printing with <span class="font-medium text-highlighted">{{ currentOption.name }}</span>
          <span v-if="!choice.chosenBySchool"> ({{ defaultLabel }})</span>.
        </template>
        <template v-else-if="choice.current">
          The current design is no longer on the document service - pick another.
        </template>
        <template v-else>No design chosen yet - pick one below.</template>
      </p>

      <div v-if="choice.options.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <button v-for="option in choice.options" :key="option.ref" type="button"
          class="group relative overflow-hidden rounded-lg border text-left transition focus-visible:outline-2 focus-visible:outline-primary"
          :class="selected === option.ref ? 'border-primary ring-2 ring-primary/40' : 'border-default hover:border-primary/50'"
          :aria-pressed="selected === option.ref" @click="selected = option.ref">
          <div class="flex aspect-[3/4] items-center justify-center overflow-hidden bg-elevated">
            <img v-if="pictures[option.ref]" :src="pictures[option.ref]!" :alt="`Preview of ${option.name}`"
              class="size-full object-contain" loading="lazy">
            <div v-else class="flex flex-col items-center gap-1 px-2 text-center text-muted">
              <UIcon name="i-lucide-file-text" class="size-8" />
              <span class="text-[11px]">No picture</span>
            </div>
          </div>
          <div class="space-y-0.5 p-2">
            <p class="line-clamp-2 text-xs font-medium text-highlighted">{{ option.name }}</p>
            <UTooltip v-if="option.missing" :disabled="!option.missing.length"
              :text="option.missing.length ? `Left blank: ${option.missing.join(', ')}` : ''">
              <UBadge size="sm" variant="soft" class="mt-1" :color="fitColor(option)"
                :icon="option.missing.length ? 'i-lucide-circle-alert' : 'i-lucide-circle-check'" :label="fitLabel(option)" />
            </UTooltip>
          </div>
          <UIcon v-if="selected === option.ref" name="i-lucide-circle-check" class="absolute right-2 top-2 size-5 rounded-full bg-default text-primary" />
          <UBadge v-if="option.ref === choice.current" size="sm" color="neutral" variant="solid" label="Current"
            class="absolute left-2 top-2" />
        </button>
      </div>
      <p v-else class="text-sm text-muted">
        No templates have been created for this document yet. Templates made in the document designer appear here.
      </p>

      <div class="flex flex-wrap items-center justify-between gap-2">
        <USwitch v-model="showAll" size="sm" label="Show every design" />
        <div class="flex flex-wrap gap-2">
          <UButton v-if="linksPage && choice.current" size="sm" variant="soft" color="neutral" icon="i-lucide-link"
            label="Link data" :to="{ path: linksPage, query: { kind, template: choice.current } }" />
          <UButton v-if="choice.chosenBySchool" size="sm" variant="ghost" color="neutral" :label="`Use ${defaultLabel}`"
            :loading="saving === 'default'" :disabled="!!saving" @click="save(null)" />
          <UButton size="sm" icon="i-lucide-check" label="Use this design" :loading="saving === 'pick'"
            :disabled="!selected || selected === choice.current || !!saving" @click="save(selected)" />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
// Picks the M-Compose design a school prints one kind of document with, from the designs on the engine. With an
// examId it picks that exam's own design instead, whose fallback is the school's general exam design.
const props = withDefaults(defineProps<{
  kind: DocumentDesignKind, examId?: string | null, defaultLabel?: string,
  // The page where the current design's placeholders are linked to Skultem's data (shows a "Link data" button).
  linksPage?: string | null
  // A level's own design (PRIMARY, JSS...), whose fallback is the school's general design.
  level?: string | null
}>(), {
  level: null,
  examId: null,
  defaultLabel: 'the default',
  linksPage: null
})
const emit = defineEmits<{ saved: [choice: DocumentDesignChoice] }>()
const { success, error: toastError } = useNotify()
const documentService = useDocumentService()

const choice = ref<DocumentDesignChoice>()
const loading = ref(true)
const failure = ref<string | null>(null)
const selected = ref<string | null>(null)
const showAll = ref(false)
const saving = ref<'pick' | 'default' | null>(null)
const pictures = reactive<Record<string, string | null>>({})

// How much of the design Skultem fills in: all of it, most of it, or little (a design made for something else).
function fitLabel(o: DocumentDesignOption) {
  const missing = o.missing?.length ?? 0
  if (!missing) return 'All fields filled'
  return `${missing} of ${o.fields} field${o.fields === 1 ? '' : 's'} blank`
}
function fitColor(o: DocumentDesignOption) {
  const missing = o.missing?.length ?? 0
  if (!missing) return 'success' as const
  return missing / Math.max(o.fields ?? 1, 1) <= 0.25 ? 'warning' as const : 'error' as const
}

const currentOption = computed(() => choice.value?.options.find(o => o.ref === choice.value?.current))

function take(next: DocumentDesignChoice) {
  choice.value = next
  selected.value = next.current || null
  for (const option of next.options) {
    if (option.hasPreview && !(option.ref in pictures)) {
      pictures[option.ref] = null
      DocumentDesignApi().preview(option.ref).then((url) => { pictures[option.ref] = url })
    }
  }
}

function fetchChoice(all: boolean) {
  const api = DocumentDesignApi()
  if (props.examId) return api.examChoice(props.examId, props.kind, all)
  if (props.level) return api.levelChoice(props.level, props.kind, all)
  return api.choice(props.kind, all)
}

async function load() {
  loading.value = true
  failure.value = null
  try {
    take(await fetchChoice(showAll.value))
  } catch (err: any) {
    failure.value = err?.message || 'The designs could not be loaded'
  } finally {
    loading.value = false
  }
}

async function save(template: string | null) {
  saving.value = template ? 'pick' : 'default'
  try {
    const api = DocumentDesignApi()
    const next = props.examId
      ? await api.examChoose(props.examId, props.kind, template)
      : props.level
        ? await api.levelChoose(props.level, props.kind, template)
        : await api.choose(props.kind, template)
    if (showAll.value) take(next)
    else take(await fetchChoice(false))
    // Downloads check whether the school has a design; ask again next time.
    documentService.status.value = null
    success(template ? 'Design saved - new documents use it from now on' : `Back to ${props.defaultLabel}`)
    emit('saved', next)
  } catch (err: any) {
    toastError(err?.message || 'The design could not be saved')
  } finally {
    saving.value = null
  }
}

watch(showAll, load)
onMounted(load)
</script>
