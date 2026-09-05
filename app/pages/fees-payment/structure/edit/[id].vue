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
// Only editable for a CLASS/ALL fee - a SELECTION fee (specific students picked by hand) can't
// carry either flag, same rule the backend enforces (see FeeStructure#update).
const isSelectionType = ref(false);

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

type SupplyItemRow = { key: string, materialId: string, quantity: number };

type FeeStructureForm = {
  termId: string;
  feeCategory: string;
  amount: number | null;
  dueDate: string;
  allowInstallment: boolean;
  hasSupply: boolean;
  supplyItems: SupplyItemRow[];
  description?: string;
  newStudentsOnly: boolean;
  oldStudentsOnly: boolean;
  gender: "" | "MALE" | "FEMALE";
};

const state = reactive<FeeStructureForm>({
  termId: "",
  feeCategory: "",
  amount: null,
  dueDate: "",
  allowInstallment: false,
  hasSupply: false,
  supplyItems: [],
  description: "",
  newStudentsOnly: false,
  oldStudentsOnly: false,
  gender: "",
});

// No "All Genders" entry here - a Reka UI Combobox item's value can't be an empty string (it's
// reserved internally to mean "cleared"). Nothing selected already shows the "All Genders"
// placeholder, and the select's own clear button (:clear below) gets back to it.
const genderOptions = [
  { label: "Boys Only", value: "MALE" },
  { label: "Girls Only", value: "FEMALE" },
];

// Turning one on turns the other off - the backend rejects both being true at once, and a radio
// pair reads more clearly here than two independent switches that can silently conflict.
watch(() => state.newStudentsOnly, (value) => {
  if (value) state.oldStudentsOnly = false;
});
watch(() => state.oldStudentsOnly, (value) => {
  if (value) state.newStudentsOnly = false;
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

  supplyItems: yup.array().when("hasSupply", {
    is: true,
    then: (schema) => schema.min(1, "Add at least one supply item"),
    otherwise: (schema) => schema,
  }),

  description: yup.string().nullable(),
});

async function onSubmit() {
  try {
    isLoading.value = true;

    await schema.validate(state, {
      abortEarly: false,
    });

    const supplyItems = state.supplyItems
      .filter((row) => row.materialId)
      .map((row) => ({ materialId: row.materialId, quantity: row.quantity || 1 }));

    if (state.hasSupply && !supplyItems.length) {
      toastError("Select a material for each supply item.");
      isLoading.value = false;
      return;
    }

    await feeStructureStore.update(route.params.id as string, {
      feeCategory: state.feeCategory,
      termId: state.termId,
      amount: state.amount || 0,
      dueDate: state.dueDate,
      allowInstallment: state.allowInstallment,
      hasSupply: state.hasSupply,
      supplyItems: state.hasSupply ? supplyItems : [],
      description: state.description,
      newStudentsOnly: isSelectionType.value ? false : state.newStudentsOnly,
      oldStudentsOnly: isSelectionType.value ? false : state.oldStudentsOnly,
      gender: isSelectionType.value ? null : (state.gender || null),
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
    state.supplyItems = (fee.supplyItems || []).map((item: FeeStructureSupplyItem) => ({
      key: crypto.randomUUID(),
      materialId: item.material.id,
      quantity: item.quantity,
    }));
    state.description = fee.description;
    state.newStudentsOnly = fee.newStudentsOnly;
    state.oldStudentsOnly = fee.oldStudentsOnly;
    state.gender = fee.gender || "";
    isSelectionType.value = fee.type === "SELECTION";
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
    if (!value) state.supplyItems = [];
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

              <!-- Supply Items -->
              <FeeStructureSupplyItemEditor v-if="state.hasSupply" v-model="state.supplyItems" :materials="materials" />

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
                title="Who this applies to can't be changed"
                description="Whether this fee targets a class, a hand-picked selection of students, or everyone was set when it was created and can't be edited - delete and recreate it instead if that needs to change. New/Old Students Only and Gender below can still be adjusted, but only affect enrollments from this point on - it won't add or remove the fee for students already enrolled."
              />

              <!-- New/Old Students Only - not available for a hand-picked selection of students,
                   same rule the backend enforces (see FeeStructure#update). -->
              <template v-if="!isSelectionType">
                <UFormField name="newStudentsOnly">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="font-medium">New Students Only</p>
                      <p class="text-xs text-muted">Only charged on a student's first-ever enrollment.</p>
                    </div>

                    <USwitch v-model="state.newStudentsOnly" :disabled="isLoading" />
                  </div>
                </UFormField>

                <UFormField name="oldStudentsOnly">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="font-medium">Old Students Only</p>
                      <p class="text-xs text-muted">Only charged to students who are re-enrolling.</p>
                    </div>

                    <USwitch v-model="state.oldStudentsOnly" :disabled="isLoading" />
                  </div>
                </UFormField>

                <UFormField label="Gender" name="gender">
                  <USelectMenu v-model="state.gender" value-key="value" :items="genderOptions"
                    placeholder="All Genders" clear :disabled="isLoading" />

                  <template #help>
                    <p class="text-xs text-muted">
                      Restrict this fee to one gender - e.g. a boys' vs girls' uniform priced
                      differently under two separate fees for the same class/term.
                    </p>
                  </template>
                </UFormField>
              </template>
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
