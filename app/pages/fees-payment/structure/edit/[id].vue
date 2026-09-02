<script setup lang="ts">
import * as yup from "yup";

const route = useRoute();
const feeStructureStore = useFeeStructureStore();
const feeCategoryStore = useFeeStore();
const termStore = useTermStore();
const materialStore = useMaterialStore();

const { error: toastError, success: toastSuccess } = useNotify();

const isLoading = ref(false);
const isFetching = ref(true);
// Display-only - not editable, so it's kept out of the submitted form state entirely (see the
// locked "Assignment can't be changed" alert below).
const newStudentsOnly = ref(false);

const categories = computed(() =>
  feeCategoryStore.records
    .filter((e) => !e.system)
    .map((e) => ({
      label: e.name,
      value: e.id,
    }))
);

const materials = computed(() =>
  materialStore.records.map((e) => ({
    label: e.name,
    value: e.id,
  }))
);

const terms = computed(() =>
  termStore.records.map((e) => ({
    label: e.name,
    value: e.id,
  }))
);

type FeeStructureForm = {
  termId: string;
  feeCategory: string;
  amount: number | null;
  dueDate: string;
  allowInstallment: boolean;
  hasSupply: boolean;
  totalSupply: number;
  material: string;
  description?: string;
};

const state = reactive<FeeStructureForm>({
  termId: "",
  feeCategory: "",
  amount: null,
  dueDate: "",
  allowInstallment: false,
  hasSupply: false,
  totalSupply: 0,
  material: "",
  description: "",
});

const schema = yup.object({
  termId: yup.string().required("Term is required"),

  feeCategory: yup.string().required("Fee category is required"),

  amount: yup
    .number()
    .typeError("Amount must be a number")
    .required("Amount is required")
    .positive("Amount must be greater than 0"),

  dueDate: yup.string().required("Due date is required"),

  allowInstallment: yup.boolean(),

  hasSupply: yup.boolean(),

  totalSupply: yup.number().when("hasSupply", {
    is: true,
    then: (schema) =>
      schema.required("Total supply is required").min(1, "Supply must be greater than 0"),
    otherwise: (schema) => schema.default(0),
  }),

  description: yup.string().nullable(),
});

async function onSubmit() {
  try {
    isLoading.value = true;

    await schema.validate(state, {
      abortEarly: false,
    });

    await feeStructureStore.update(route.params.id as string, {
      feeCategory: state.feeCategory,
      termId: state.termId,
      amount: state.amount || 0,
      dueDate: state.dueDate,
      allowInstallment: state.allowInstallment,
      hasSupply: state.hasSupply,
      totalSupply: state.hasSupply ? state.totalSupply : 0,
      materialId: state.material,
      description: state.description,
    });

    toastSuccess("Fee structure updated successfully");

    navigateTo("/fees-payment/structure");
  } catch (err: any) {
    toastError(err?.errors?.[0] || err?.message || "Something went wrong");
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  useAppStore().setTitle("Edit Fee Structure");
  document.title = "Edit | Fee Structure | Fees Payment | Skultem";

  isFetching.value = true;
  try {
    await Promise.all([
      feeCategoryStore.fetchAll(0, 0),
      termStore.fetchAll(0, 0),
      materialStore.fetchAll(0, 0),
    ]);

    const fee = await feeStructureStore.getOne(route.params.id as string);

    if (fee.isSystem) {
      toastError("The platform fee can't be edited");
      navigateTo("/fees-payment/structure");
      return;
    }

    state.termId = fee.term.id;
    state.feeCategory = fee.category.id;
    state.amount = fee.amount;
    state.dueDate = fee.dueDate;
    state.allowInstallment = fee.allowInstallment;
    state.hasSupply = fee.hasSupply;
    state.totalSupply = fee.totalSupply;
    state.material = fee.material?.id || "";
    state.description = fee.description;
    newStudentsOnly.value = fee.newStudentsOnly;
  } catch (err: any) {
    toastError(err?.message || "Failed to load fee structure");
    navigateTo("/fees-payment/structure");
  } finally {
    isFetching.value = false;
  }
});

watch(
  () => state.hasSupply,
  (value) => {
    if (!value) state.material = "";
  }
);

definePageMeta({
  role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER],
});
</script>

<template>
  <div class="px-4 md:px-6">
    <UForm v-if="!isFetching" ref="formRef" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
      <div class="grid lg:grid-cols-2 gap-4">
        <!-- Fee Details -->
        <div>
          <UCard class="sticky top-2">
            <div class="space-y-2.5">
              <!-- Term -->
              <UFormField label="Term" name="termId" required>
                <USelectMenu v-model="state.termId" value-key="value" :items="terms" placeholder="Select term"
                  disabled />

                <template #help>
                  <p class="text-xs text-muted">
                    The term this fee applies to can't be changed after creation.
                  </p>
                </template>
              </UFormField>

              <!-- Category -->
              <UFormField label="Fee Category" name="feeCategory" required>
                <USelectMenu v-model="state.feeCategory" value-key="value" :items="categories"
                  placeholder="Select fee category" :disabled="isLoading" />

                <template #help>
                  <p class="text-xs text-muted">
                    Example: Tuition, Exam, PTA or Development.
                  </p>
                </template>
              </UFormField>

              <!-- Amount -->
              <UFormField label="Amount" name="amount" required>
                <UInput v-model.number="state.amount" type="number" min="0" placeholder="Enter amount"
                  :disabled="isLoading" />

                <template #help>
                  <p class="text-xs text-muted">
                    Total amount students are required to pay.
                  </p>
                </template>
              </UFormField>

              <!-- Due Date -->
              <UFormField label="Due Date" name="dueDate" required>
                <UInput v-model="state.dueDate" type="date" :disabled="isLoading" />

                <template #help>
                  <p class="text-xs text-muted">Deadline for completing payment.</p>
                </template>
              </UFormField>

              <div class="grid grid-cols-2 gap-3">
                <!-- Material -->
                <UFormField v-if="state.hasSupply" label="Material" name="material" required>
                  <USelectMenu v-model="state.material" value-key="value" :items="materials"
                    placeholder="Select material" :disabled="isLoading" />

                  <template #help>
                    <p class="text-xs text-muted">
                      Select the type of material or supply item.
                    </p>
                  </template>
                </UFormField>

                <!-- Total Supply -->
                <UFormField v-if="state.hasSupply" label="Total Supply" name="totalSupply" required>
                  <UInput v-model.number="state.totalSupply" type="number" min="1" placeholder="Enter quantity"
                    :disabled="isLoading" />

                  <template #help>
                    <p class="text-xs text-muted">
                      Number of items each student will receive.
                    </p>
                  </template>
                </UFormField>
              </div>

              <!-- Description -->
              <UFormField label="Description" name="description">
                <UTextarea v-model="state.description" placeholder="Optional description" :disabled="isLoading" />

                <template #help>
                  <p class="text-xs text-muted">
                    Additional notes or payment instructions.
                  </p>
                </template>
              </UFormField>
            </div>
          </UCard>
        </div>

        <!-- Options -->
        <div>
          <UCard class="sticky top-0">
            <div class="space-y-4">
              <!-- Installment -->
              <UFormField name="allowInstallment">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium">Allow Installment</p>
                    <p class="text-xs text-muted">Students can pay in multiple parts.</p>
                  </div>

                  <USwitch v-model="state.allowInstallment" :disabled="isLoading" />
                </div>
              </UFormField>

              <!-- Has Supply -->
              <UFormField name="hasSupply">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium">Has Supply</p>
                    <p class="text-xs text-muted">
                      Supplies will be issued after payment completion.
                    </p>
                  </div>

                  <USwitch v-model="state.hasSupply" :disabled="isLoading" />
                </div>
              </UFormField>

              <!-- Info -->
              <UAlert
                color="neutral"
                variant="soft"
                icon="i-lucide-lock"
                title="Assignment can't be changed"
                :description="`Who this fee applies to (class or students), its type, and whether it's new-students-only were set when it was created and can't be edited. Delete and recreate it instead if that needs to change.`"
              />

              <UBadge v-if="newStudentsOnly" size="sm" variant="subtle" color="info"
                icon="i-lucide-user-plus" label="New Students Only" />
            </div>
            <template #footer>
              <div class="flex justify-end gap-3">
                <UButton label="Cancel" color="neutral" variant="outline" :disabled="isLoading"
                  to="/fees-payment/structure" />

                <UButton type="submit" :trailing-icon="SAVE_ICON" label="Save Changes" :loading="isLoading" />
              </div>
            </template>
          </UCard>
        </div>
      </div>
    </UForm>

    <!-- Loading -->
    <div v-else class="grid lg:grid-cols-2 gap-4">
      <UCard>
        <div class="space-y-3">
          <USkeleton v-for="i in 5" :key="i" class="h-10 w-full rounded-lg" />
        </div>
      </UCard>

      <UCard>
        <div class="space-y-3">
          <USkeleton v-for="i in 3" :key="i" class="h-10 w-full rounded-lg" />
        </div>
      </UCard>
    </div>
  </div>
</template>
