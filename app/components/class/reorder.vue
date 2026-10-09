<template>
  <USlideover v-model:open="open" title="Arrange classes"
    description="Drag a class, or use the arrows, to set its rank. Reports follow this order.">
    <template #body>
      <ul class="space-y-2">
        <li v-for="(c, i) in items" :key="c.id" draggable="true"
          class="flex items-center gap-3 rounded-lg border border-default bg-default px-3 py-2 transition"
          :class="dragIndex === i ? 'opacity-50 ring-2 ring-primary' : 'hover:bg-elevated'"
          @dragstart="onDragStart(i, $event)" @dragenter.prevent="onDragEnter(i)" @dragover.prevent
          @dragend="dragIndex = null">
          <UIcon name="i-lucide-grip-vertical" class="size-4 shrink-0 cursor-grab text-muted" />
          <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold">
            {{ i + 1 }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-highlighted">{{ c.name }}</p>
            <p class="text-xs text-muted">{{ levelLabel(c.level) }}</p>
          </div>
          <UButton icon="i-lucide-chevron-up" color="neutral" variant="ghost" size="xs" aria-label="Move up"
            :disabled="i === 0" @click="move(i, i - 1)" />
          <UButton icon="i-lucide-chevron-down" color="neutral" variant="ghost" size="xs" aria-label="Move down"
            :disabled="i === items.length - 1" @click="move(i, i + 1)" />
        </li>
      </ul>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton label="Reset" color="neutral" variant="ghost" :disabled="!changed || saving" @click="reset" />
        <UButton label="Save order" icon="i-lucide-check" :disabled="!changed" :loading="saving" @click="save" />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
const props = defineProps<{ classes: Clazz[] }>()
const emit = defineEmits<{ saved: [] }>()
const open = defineModel<boolean>('open', { default: false })

const classStore = useClassStore()
const toast = useToast()

const items = ref<Clazz[]>([])
const dragIndex = ref<number | null>(null)
const saving = ref(false)

const byRank = () => [...props.classes].sort((a, b) => a.levelOrder - b.levelOrder)
const reset = () => { items.value = byRank() }

// Start from the saved order each time the panel opens.
watch(open, (isOpen) => { if (isOpen) reset() }, { immediate: true })

const changed = computed(() => items.value.some((c, i) => c.id !== byRank()[i]?.id))

function move(from: number, to: number) {
  if (to < 0 || to >= items.value.length || from === to) return
  const next = [...items.value]
  next.splice(to, 0, next.splice(from, 1)[0]!)
  items.value = next
}

function onDragStart(i: number, e: DragEvent) {
  dragIndex.value = i
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

// Re-order live as the dragged row passes over another, so the list shows where it will land.
function onDragEnter(i: number) {
  if (dragIndex.value === null || dragIndex.value === i) return
  move(dragIndex.value, i)
  dragIndex.value = i
}

async function save() {
  saving.value = true
  try {
    const ok = await classStore.reorder(items.value.map(c => c.id))
    if (!ok) return
    toast.add({ title: 'Class order saved', color: 'success' })
    emit('saved')
    open.value = false
  } finally {
    saving.value = false
  }
}
</script>
