<template>
  <UCard>
    <template #header>
      <p>General Information</p>
    </template>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <UFormField required label="School Name">
        <UInput v-model="state.name" placeholder="e.g. King's Way International School" class="w-full" />
      </UFormField>

      <UFormField label="Motto" help="Shown under your school's name across the app">
        <UInput v-model="state.motto" placeholder="e.g. Knowledge, Character, Excellence" class="w-full" />
      </UFormField>

      <UFormField required label="Domain" help="Used for your school's login link">
        <UInput v-model="state.domain" placeholder="e.g. kingsway" class="w-full" />
      </UFormField>

      <UFormField label="Principal Name">
        <UInput v-model="state.principalName" placeholder="e.g. Dr. A. Conteh" class="w-full" />
      </UFormField>
    </div>
  </UCard>
  <UCard>
    <template #header>
      <p>Address</p>
    </template>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <UFormField required label="Street">
        <UInput v-model="state.street" placeholder="e.g. 12 Wilkinson Road" class="w-full" />
      </UFormField>

      <UFormField required label="City">
        <UInput v-model="state.city" placeholder="e.g. Freetown" class="w-full" />
      </UFormField>

      <UFormField required label="Region">
        <UInput v-model="state.region" placeholder="e.g. Western Area" class="w-full" />
      </UFormField>

      <UFormField required label="District">
        <UInput v-model="state.district" placeholder="e.g. Freetown" class="w-full" />
      </UFormField>

      <UFormField required label="Chiefdom">
        <UInput v-model="state.chiefdom" placeholder="e.g. Freetown Municipality" class="w-full" />
      </UFormField>
    </div>
  </UCard>

  <UCard>
    <template #header>
      <p>Branding & Appearance</p>
    </template>
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <UploadTile label="School Logo" hint="Square PNG" :src="logoPreview" @select="(f) => emit('select-logo', f)"
        @clear="emit('clear-logo')" />
      <UploadTile label="Principal Signature" hint="Transparent PNG" :src="signaturePreview" muted
        @select="(f) => emit('select-signature', f)" @clear="emit('clear-signature')" />
    </div>

    <div class="mt-5 grid grid-cols-1 gap-4 border-t border-default pt-5 sm:grid-cols-2">
      <UFormField label="Primary Color" help="Used for headers and accents on ID cards">
        <ColorPicker v-model="state.primaryColor" />
      </UFormField>

      <UFormField label="Secondary Color" help="Used for footers and secondary accents">
        <ColorPicker v-model="state.secondaryColor" />
      </UFormField>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import ColorPicker from '~/components/id-cards/ColorPicker.vue'

// `state` is the parent's own reactive form object, passed straight through (not copied) - the
// fields below mutate it directly via v-model, same as if this markup were still inline on the
// page. Kept as one object prop rather than one prop per field since save()/applySchool() on the
// page already own the whole shape.
defineProps<{
  state: {
    name: string
    motto: string
    domain: string
    street: string
    city: string
    region: string
    district: string
    chiefdom: string
    principalName: string
    primaryColor: string
    secondaryColor: string
  }
  logoPreview: string
  signaturePreview: string
}>()

const emit = defineEmits<{
  'select-logo': [File]
  'clear-logo': []
  'select-signature': [File]
  'clear-signature': []
}>()
</script>
