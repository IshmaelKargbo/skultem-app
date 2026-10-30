<script setup lang="ts">
// Asks why before an action that must be explained: following up a visit, cancelling a session, changing a
// register's roster or correcting a finalized mark. The reason is required and kept with the record.
const props = withDefaults(defineProps<{
  title: string
  description?: string
  confirmLabel: string
  color?: 'primary' | 'error' | 'warning'
  loading?: boolean
  placeholder?: string
}>(), { color: 'primary', loading: false, description: undefined, placeholder: 'Why?' })

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ confirm: [reason: string] }>()
const reason = ref('')

watch(open, (isOpen) => { if (isOpen) reason.value = '' })

function confirm() {
  const value = reason.value.trim()
  if (value) emit('confirm', value)
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">{{ props.title }}</h3>
          <p v-if="props.description" class="mt-1 text-sm text-muted">{{ props.description }}</p>
        </template>

        <slot />

        <UFormField label="Reason" required>
          <UTextarea v-model="reason" :rows="3" :maxlength="500" :placeholder="props.placeholder" autofocus
            :disabled="props.loading" class="w-full" />
        </UFormField>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton label="Back" variant="outline" color="neutral" :disabled="props.loading" @click="() => { open = false }" />
            <UButton :label="props.confirmLabel" :color="props.color" :loading="props.loading"
              :disabled="!reason.trim()" @click="confirm" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
