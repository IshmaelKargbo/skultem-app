<script setup lang="ts">
import * as yup from "yup";

const store = usePlatformStore();
const { feeSetting, loading } = storeToRefs(store);
const { format } = useMoney();
const { error: toastError, success: toastSuccess } = useNotify();

const isSaving = ref(false);

const state = reactive({
  amount: null as number | null,
});

const schema = yup.object({
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .required("Amount is required")
    .positive("Amount must be greater than 0"),
});

async function onSubmit() {
  try {
    isSaving.value = true;

    await schema.validate(state, { abortEarly: false });

    await store.updateFeeSetting(state.amount || 0);

    toastSuccess("Platform fee setting updated successfully");
  } catch (err: any) {
    toastError(err?.errors?.[0] || err?.message || "Something went wrong");
  } finally {
    isSaving.value = false;
  }
}

onMounted(async () => {
  useAppStore().setTitle("Platform Settings");
  document.title = "Platform Fee | Skultem";

  await store.getFeeSetting();
  state.amount = feeSetting.value.amount;
});

definePageMeta({
  role: [Role.SYSTEM_ADMIN, Role.ADMIN, Role.OWNER],
});
</script>

<template>
  <div class="px-4 md:px-6">
    <div class="space-y-4">
      <UAlert
        color="warning"
        variant="soft"
        icon="i-lucide-shield"
        title="System-admin only"
        description="This amount seeds the platform fee every school's students are charged, once per academic year. It isn't reachable from any school's own settings, and schools can't edit or delete the fee once it's created."
      />

      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Platform Fee Amount</h3>
        </template>

        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField label="Amount" name="amount" required>
            <UInput
              v-model.number="state.amount"
              type="number"
              min="0"
              placeholder="Enter amount"
              :disabled="loading || isSaving"
            />

            <template #help>
              <p class="text-xs text-muted">
                Charged once per student per academic year, across every school on the platform.
              </p>
            </template>
          </UFormField>

          <p v-if="feeSetting.updatedAt" class="text-xs text-muted">
            Current amount: {{ feeSetting.amount != null ? format(feeSetting.amount) : "Not set" }}
            · Last updated {{ formatDate(feeSetting.updatedAt) }}
          </p>
          <p v-else class="text-xs text-muted">
            No amount has been set yet - no platform fee will be seeded for any school until one is.
          </p>

          <div class="flex justify-end">
            <UButton type="submit" :trailing-icon="SAVE_ICON" label="Save" :loading="isSaving" />
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>
