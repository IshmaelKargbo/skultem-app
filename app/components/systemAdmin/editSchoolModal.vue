<script setup lang="ts">
import * as yup from "yup";

const props = defineProps<{
  open: boolean
  school: SystemSchool
}>()

const emit = defineEmits<{
  'update:open': [boolean]
}>()

const store = useSystemStore()
const { error: toastError, success: toastSuccess } = useNotify()
const { regionOptions, districtOptions } = useRdcsl()

const open = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v)
})

const loading = ref(false)

const state = reactive({
  name: "",
  domain: "",
  street: "",
  city: "",
  region: "",
  district: "",
  chiefdom: "",
});

const schema = yup.object({
  name: yup.string().min(3, "School name must be at least 3 characters").required("School name is required"),
  domain: yup.string().required("Domain is required"),
  street: yup.string().min(5, "Street must be at least 5 characters").required("Street is required"),
  city: yup.string().required("City is required"),
  region: yup.string().required("Region is required"),
  district: yup.string().required("District is required"),
  chiefdom: yup.string().min(5, "Chiefdom must be at least 5 characters").required("Chiefdom is required"),
});

// Re-seed the form with this school's current profile every time the modal opens - same pattern
// as SystemAdminPlatformFeeModal, so a previously opened school's edits never leak into this one.
watch(() => props.open, (value) => {
  if (!value) return;
  state.name = props.school.name ?? "";
  state.domain = props.school.domain ?? "";
  state.street = props.school.address?.street ?? "";
  state.city = props.school.address?.city ?? "";
  state.region = props.school.address?.region ?? "";
  state.district = props.school.address?.district ?? "";
  state.chiefdom = props.school.address?.chiefdom ?? "";
});

// A district only makes sense within its region. Goes through a computed rather than a plain
// watch(() => state.region) so the seeding above - which sets region and district together from
// the school's existing address - never has its district wiped out; only a region change made
// through the select below (i.e. someone actually picking a new region) clears it.
const region = computed({
  get: () => state.region,
  set: (value: string) => {
    state.region = value;
    state.district = "";
  },
});

function close() {
  open.value = false;
}

async function onSubmit() {
  try {
    loading.value = true;

    await schema.validate(state, { abortEarly: false });

    const updated = await store.updateSchool(props.school.id, {
      name: state.name,
      domain: state.domain,
      street: state.street,
      city: state.city,
      region: state.region,
      district: state.district,
      chiefdom: state.chiefdom,
    });

    if (!updated) return;

    toastSuccess(`${clean(state.name)} updated`);
    close();
  } catch (err: any) {
    toastError(err?.errors?.[0] || err?.message || "Something went wrong");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UModal v-model:open="open">
    <template #content>
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Edit School · {{ clean(school.name) }}</h3>
        </template>

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UFormField label="School Name" name="name" required>
              <UInput v-model="state.name" class="w-full" :disabled="loading" />
            </UFormField>

            <UFormField label="Domain" name="domain" required help="Changing this moves the school's login link">
              <UInput v-model="state.domain" class="w-full" :disabled="loading" />
            </UFormField>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <UFormField label="Street" name="street" required class="sm:col-span-2">
              <UInput v-model="state.street" class="w-full" :disabled="loading" />
            </UFormField>

            <UFormField label="City" name="city" required>
              <UInput v-model="state.city" class="w-full" :disabled="loading" />
            </UFormField>

            <UFormField label="Region" name="region" required>
              <USelectMenu v-model="region" value-key="value" :items="regionOptions" placeholder="Select region"
                class="w-full" :disabled="loading" />
            </UFormField>

            <UFormField label="District" name="district" required>
              <USelectMenu v-model="state.district" value-key="value" :items="districtOptions(state.region)"
                :placeholder="state.region ? 'Select district' : 'Select a region first'" class="w-full"
                :disabled="loading || !state.region" />
            </UFormField>

            <UFormField label="Chiefdom" name="chiefdom" required>
              <UInput v-model="state.chiefdom" class="w-full" :disabled="loading" />
            </UFormField>
          </div>
        </UForm>

        <template #footer>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <UButton label="Cancel" variant="soft" color="neutral" :disabled="loading" @click="close" />
            <UButton label="Save" :trailing-icon="SAVE_ICON" :loading="loading" @click="onSubmit" />
          </div>
        </template>
      </UCard>
    </template>
  </UModal>
</template>
