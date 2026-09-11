<script setup lang="ts">
const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [boolean]
  duplicated: []
}>()

const open = computed({
  get: () => props.open,
  set: v => emit('update:open', v)
})

const store = useClassSubjectStore()
const sessionStore = useClassSessionStore()
const { success: toastSuccess, warning: toastWarning, error: toastError } = useNotify()

const sourceClassId = ref('')
const targetClassIds = ref<string[]>([])
const saving = ref(false)

const classes = computed(() =>
  sessionStore.records.map(e => {
    let section = e.sectionName

    if (e.streamName) {
      section = section ? `${section} - ${e.streamName}` : e.streamName
    }

    return {
      label: `${e.clazz} ${section ? `(${section})` : ''}`,
      value: e.id
    }
  })
)

// A class can't duplicate its own subjects onto itself.
const targetOptions = computed(() =>
  classes.value.filter(c => c.value !== sourceClassId.value)
)

watch(sourceClassId, () => {
  targetClassIds.value = targetClassIds.value.filter(id => id !== sourceClassId.value)
})

function reset() {
  sourceClassId.value = ''
  targetClassIds.value = []
}

function close() {
  open.value = false
}

watch(open, (val) => {
  if (val && !sessionStore.records.length) {
    sessionStore.fetchAll(0, 0)
  }
  if (!val) reset()
})

function labelFor(id: string) {
  return classes.value.find(c => c.value === id)?.label || id
}

async function submit() {
  if (!sourceClassId.value) {
    toastWarning('Choose the class to copy subjects from')
    return
  }

  if (!targetClassIds.value.length) {
    toastWarning('Choose at least one class to duplicate the subjects into')
    return
  }

  saving.value = true

  try {
    const res = await store.duplicate(sourceClassId.value, targetClassIds.value) as any
    const result = res?.data

    const succeeded: string[] = result?.succeeded || []
    const failed: Record<string, string> = result?.failed || {}
    const failedIds = Object.keys(failed)

    if (succeeded.length) {
      toastSuccess(
        `Subjects duplicated into ${succeeded.length} class${succeeded.length > 1 ? 'es' : ''}${failedIds.length ? '; some failed - see below' : ''}`
      )
    }

    if (failedIds.length) {
      failedIds.forEach(id => toastError(`${labelFor(id)}: ${failed[id]}`))
    }

    if (succeeded.length) {
      emit('duplicated')
    }

    if (!failedIds.length) {
      close()
    }
  } catch (err: any) {
    toastError(err.message)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <div>
            <h3 class="text-lg font-semibold">
              Duplicate Class Subjects
            </h3>
            <p class="text-xs text-muted mt-1">
              Copy a class's subject list onto one or more other classes, e.g. Nursery 1 into Nursery 2.
            </p>
          </div>
        </template>

        <div class="space-y-4">
          <UFormField label="Copy subjects from" required>
            <USelectMenu v-model="sourceClassId" value-key="value" label-key="label" :items="classes"
              :loading="sessionStore.loading" placeholder="Choose the source class" class="w-full" />
          </UFormField>

          <UFormField label="Duplicate into" required>
            <USelectMenu v-model="targetClassIds" value-key="value" label-key="label" :items="targetOptions" multiple
              :loading="sessionStore.loading" :disabled="!sourceClassId" placeholder="Choose one or more classes"
              class="w-full" />
          </UFormField>

          <UAlert
            icon="lucide:info"
            variant="soft"
            color="info"
            title="This replaces the target's subject list"
            description="Each target class ends up with the same subjects, groups, and mandatory/optional settings as the source. Locked subjects (with existing grades) on a target are left untouched and can block the copy for that class."
          />
        </div>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton label="Cancel" variant="soft" color="neutral" :disabled="saving" @click="close" />

            <UButton label="Duplicate" color="primary" icon="lucide:copy" :loading="saving" @click="submit" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
