<template>
  <div class="w-full space-y-1">
    <UInput v-bind="$attrs" :model-value="modelValue ?? ''" type="email" autocomplete="email" inputmode="email"
      class="w-full" :color="problem ? 'error' : undefined" :trailing-icon="checking ? 'i-lucide-loader-circle' : undefined"
      :ui="{ trailingIcon: checking ? 'animate-spin' : '' }" @update:model-value="(v: string | number) => emit('update:modelValue', String(v))"
      @blur="checkNow" />

    <!-- What the check found. Deliberately not green: a good domain only means mail can be delivered, not that the
         address is the person's - that's what verification is for. -->
    <p v-if="checking" class="flex items-center gap-1.5 text-xs text-muted">Checking the email domain…</p>
    <p v-else-if="problem" class="flex items-start gap-1.5 text-xs text-error">
      <UIcon name="i-lucide-alert-circle" class="mt-0.5 size-3.5 shrink-0" />{{ problem }}
    </p>
    <p v-else-if="result?.status === 'UNCHECKED' && result.message" class="flex items-start gap-1.5 text-xs text-muted">
      <UIcon name="i-lucide-info" class="mt-0.5 size-3.5 shrink-0" />{{ result.message }}
    </p>
    <p v-else-if="result?.status === 'OK' && hint" class="flex items-start gap-1.5 text-xs text-muted">
      <UIcon name="i-lucide-mail" class="mt-0.5 size-3.5 shrink-0" />{{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
// An email field with the shared checks: the format as you go, the domain (does it exist, does it take mail) once
// you pause or leave the field. Drop-in for <UInput v-model="..."> on any form that collects an email - other props
// (placeholder, leading-icon, disabled…) pass straight through. The form still decides whether the field is required.
defineOptions({ inheritAttrs: false })

const { modelValue, hint = 'This domain accepts email. The owner confirms the address from a verification link.' } = defineProps<{
  modelValue?: string | null
  // Shown under a domain that checks out; empty string to show nothing.
  hint?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const value = computed(() => modelValue)
const { checking, result, checkNow } = useEmailCheck(value)

// Only a clear problem the server found - the form's own validation already reports a bad format.
const problem = computed(() =>
  result.value && !result.value.deliverable && result.value.status !== 'INVALID_FORMAT' ? result.value.message : null)
</script>
