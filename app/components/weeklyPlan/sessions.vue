<!-- The sessions of the day for weekly plans (how many subjects a day, and when): name, start and end.
     Either this class's own (every section of it, year after year) or the school's, used by every class without
     its own. -->
<template>
  <UModal v-model:open="open" title="Sessions of the day"
    description="Each school day gets one subject per session - two sessions means two subjects a day.">
    <template #body>
      <div class="space-y-3">
        <URadioGroup v-model="scope" :items="scopeItems" orientation="horizontal" />
        <p class="text-xs text-muted">
          <template v-if="scope === 'CLASS'">Only {{ className }} (all its sections) uses these.</template>
          <template v-else>Every class without its own sessions uses these.</template>
        </p>

        <div v-if="loading" class="space-y-2"><USkeleton v-for="i in 2" :key="i" class="h-24 w-full rounded-xl" /></div>
        <template v-else>
          <div v-for="(s, i) in draft" :key="i" class="grid grid-cols-[1fr_auto] gap-2 rounded-xl border border-default p-3">
            <div class="space-y-2">
              <UInput v-model="s.name" placeholder="e.g. Morning, Story time" :aria-label="`Session ${i + 1} name`" />
              <div class="grid grid-cols-2 gap-2">
                <TimeInput v-model="s.start" :aria-label="`Session ${i + 1} start`" />
                <TimeInput v-model="s.end" :aria-label="`Session ${i + 1} end`" />
              </div>
            </div>
            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" :disabled="draft.length === 1"
              :aria-label="`Remove session ${i + 1}`" @click="() => { draft.splice(i, 1) }" />
          </div>
          <UButton v-if="draft.length < 6" icon="i-lucide-plus" label="Add a session" variant="soft" block
            @click="() => { draft.push({ name: '', start: '', end: '' }) }" />
          <p class="text-xs text-muted">
            With fewer sessions, subjects already planned in the removed ones are hidden. Auto-fill again to spread the
            subjects over the new sessions.
          </p>
        </template>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full flex-wrap justify-between gap-2">
        <UButton v-if="scope === 'CLASS' && classHasOwn" label="Use the school's sessions" color="neutral" variant="ghost"
          :loading="saving === 'clear'" @click="useSchool" />
        <span v-else />
        <div class="flex gap-2">
          <UButton label="Cancel" color="neutral" variant="outline" @click="() => { open = false }" />
          <UButton label="Save" :loading="saving === 'save'" @click="save" />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { WeeklyPlanApi, type WeeklyPlanSlot } from '~/api/weeklyPlan.api'

const open = defineModel<boolean>('open', { default: false })
const props = defineProps<{ classSessionId: string, className: string }>()
const emit = defineEmits<{ saved: [] }>()
const { success, error: toastError } = useNotify()

const scope = ref<'CLASS' | 'SCHOOL'>('CLASS')
const scopeItems = computed(() => [{ label: `This class (${props.className})`, value: 'CLASS' }, { label: 'School default', value: 'SCHOOL' }])
const draft = ref<WeeklyPlanSlot[]>([])
const classHasOwn = ref(false)
const loading = ref(false)
const saving = ref<'' | 'save' | 'clear'>('')

async function load() {
  loading.value = true
  try {
    if (scope.value === 'CLASS') {
      const res = await WeeklyPlanApi().classSlots(props.classSessionId)
      classHasOwn.value = res.source === 'CLASS'
      draft.value = res.slots.map(s => ({ ...s }))
    } else {
      draft.value = (await WeeklyPlanApi().slots()).map(s => ({ ...s }))
    }
  } catch (err: any) {
    toastError(err?.data?.message || err?.message || 'The sessions could not be loaded')
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = 'save'
  try {
    if (scope.value === 'CLASS') await WeeklyPlanApi().saveClassSlots(props.classSessionId, draft.value)
    else await WeeklyPlanApi().saveSlots(draft.value)
    success(scope.value === 'CLASS' ? `Sessions saved for ${props.className}` : 'School sessions saved')
    emit('saved')
    open.value = false
  } catch (err: any) {
    toastError(err?.data?.message || err?.message || 'The sessions could not be saved')
  } finally {
    saving.value = ''
  }
}

async function useSchool() {
  saving.value = 'clear'
  try {
    await WeeklyPlanApi().clearClassSlots(props.classSessionId)
    success(`${props.className} now uses the school's sessions`)
    emit('saved')
    open.value = false
  } catch (err: any) {
    toastError(err?.data?.message || err?.message || 'Something went wrong')
  } finally {
    saving.value = ''
  }
}

watch(open, (v) => { if (v) { scope.value = 'CLASS'; load() } })
watch(scope, () => { if (open.value) load() })
</script>
