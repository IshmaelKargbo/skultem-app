<script setup lang="ts">
import * as yup from "yup";

const feeStructureStore = useFeeStructureStore();
const feeCategoryStore = useFeeStore();
const termStore = useTermStore();
const materialStore = useMaterialStore();
const { isInstalled } = useModules();
const suppliesAvailable = computed(() => isInstalled(ModuleKey.MATERIALS_AND_SUPPLIES));
const clazzStore = useClassStore();
const streamStore = useStreamStore();

const { error: toastError, success: toastSuccess } = useNotify();

const isLoading = ref(false);

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

// The fee's term, and the other terms of its year - for the installment plan's quick starts.
const selectedTerm = computed(() => termStore.records.find((t) => t.id === state.termId) ?? null);
const yearTerms = computed(() => termStore.records
  .filter((t) => !selectedTerm.value || t.academicYear?.id === selectedTerm.value.academicYear?.id)
  .map((t) => ({ name: t.name, endDate: t.endDate, termNumber: t.termNumber })));

const assignModes = [
  { label: "All Students", value: "ALL" },
  { label: "Specific Classes", value: "CLASS" },
  { label: "Select Students", value: "SELECTION" },
];

const classes = computed(() =>
  clazzStore.records.map((e) => ({
    label: e.name,
    value: e.id,
  }))
);

const streams = computed(() =>
  streamStore.records.map((e) => ({ label: e.name, value: e.id }))
);

// A stream only means something for streamed classes (SSS) - offer it when every picked class is one.
const canPickStream = computed(() =>
  state.assignMode === "CLASS" &&
  state.classIds.length > 0 &&
  state.classIds.every((id) => !!levelInfo(clazzStore.records.find((c) => c.id === id)?.level)?.streamed)
);

const genderOptions = [
  { label: "Boys Only", value: "MALE" },
  { label: "Girls Only", value: "FEMALE" },
];

type SupplyItemRow = { key: string, materialId: string, quantity: number };

type FeeStructureForm = {
  assignMode: "ALL" | "CLASS" | "SELECTION" | "";
  classIds: string[];
  termId: string;
  feeCategory: string;
  amount: number | null;
  dueDate: string;
  studentIds: string[];
  allowInstallment: boolean;
  installments: InstallmentRow[];
  hasSupply: boolean;
  supplyItems: SupplyItemRow[];
  description?: string;
  newStudentsOnly: boolean;
  oldStudentsOnly: boolean;
  gender: "" | "MALE" | "FEMALE";
  streamId: string;
};

const state = reactive<FeeStructureForm>({
  assignMode: "",
  classIds: [],
  termId: "",
  feeCategory: "",
  amount: null,
  dueDate: "",
  studentIds: [],
  allowInstallment: false,
  installments: [],
  hasSupply: false,
  supplyItems: [],
  description: "",
  newStudentsOnly: false,
  oldStudentsOnly: false,
  gender: "",
  streamId: "",
});

// Drop a picked stream once it no longer applies (mode changed, or a non-streamed class added).
watch(canPickStream, (ok) => {
  if (!ok) state.streamId = "";
});

// Mutually exclusive - a fee can only target one side of the new/old student split.
watch(
  () => state.newStudentsOnly,
  (value) => {
    if (value) state.oldStudentsOnly = false;
  }
);

watch(
  () => state.oldStudentsOnly,
  (value) => {
    if (value) state.newStudentsOnly = false;
  }
);

const schema = yup.object({
  termId: yup.string().required("Term is required"),

  assignMode: yup.string().required("Assignment is required"),

  classIds: yup.array().when("assignMode", {
    is: "CLASS",
    then: (schema) => schema.min(1, "Select at least one class"),
    otherwise: (schema) => schema,
  }),

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

  studentIds: yup.array().when("assignMode", {
    is: "SELECTION",
    then: (schema) => schema.min(1, "Select at least one student"),
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

    const isSelection = state.assignMode === "SELECTION";

    const supplyItems = state.supplyItems
      .filter((row) => row.materialId)
      .map((row) => ({ materialId: row.materialId, quantity: row.quantity || 1 }));

    if (state.hasSupply && !supplyItems.length) {
      toastError("Select a material for each supply item.");
      isLoading.value = false;
      return;
    }

    const planProblem = state.allowInstallment ? installmentPlanProblem(state.installments, state.amount) : null;
    if (planProblem) {
      toastError(planProblem);
      isLoading.value = false;
      return;
    }

    const res: any = await feeStructureStore.create({
      classIds: state.assignMode === "CLASS" ? state.classIds : null,
      studentIds: isSelection ? state.studentIds : [],
      type: state.assignMode,
      termId: state.termId,
      feeCategory: state.feeCategory,
      amount: state.amount || 0,
      dueDate: state.dueDate,
      allowInstallment: state.allowInstallment,
      installments: state.allowInstallment ? toInstallmentPayload(state.installments) : [],
      // With a plan, the fee is due when its last part is.
      ...(state.allowInstallment && state.installments.length
        ? { dueDate: state.installments[state.installments.length - 1]!.dueDate }
        : {}),
      hasSupply: state.hasSupply,
      supplyItems: state.hasSupply ? supplyItems : [],
      description: state.description,
      newStudentsOnly: !isSelection && state.newStudentsOnly,
      oldStudentsOnly: !isSelection && state.oldStudentsOnly,
      gender: !isSelection && state.gender ? state.gender : null,
      streamId: canPickStream.value && state.streamId ? state.streamId : null,
    });

    await feeStructureStore.fetchAll();

    const created = res?.data?.length ?? 1;
    toastSuccess(
      created > 1
        ? `Fee structure created for ${created} classes successfully`
        : "Fee structure created successfully"
    );

    navigateTo("/fees-payment/structure");
  } catch (err: any) {
    toastError(err?.errors?.[0] || err?.message || "Something went wrong");
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  useAppStore().setTitle("Add Fee Structure");
  document.title = "Add | Fee Structure | Fees Payment | Skultem";
  feeCategoryStore.fetchAll(0, 0);
  termStore.fetchAll(0, 0);
  clazzStore.fetchAll(0, 0);
  streamStore.fetchAll(0, 0);
  if (suppliesAvailable.value) materialStore.fetchAll(0, 0);
});

watch(
  () => state.allowInstallment,
  (value) => {
    if (!value) state.installments = [];
  }
);

watch(
  () => state.hasSupply,
  (value) => {
    if (!value) state.supplyItems = [];
  },
  { immediate: true }
);

definePageMeta({
  role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN],
});
</script>

<template>
  <div class="space-y-3 px-4 md:px-6">
    <GuideBar topic="finance-structure-add" />
    <UForm ref="formRef" :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
      <div class="grid lg:grid-cols-2 gap-4">
        <!-- Fee Details -->
        <div>
          <UCard  class="sticky top-2">
            <div class="space-y-2.5">
              <!-- Term -->
              <UFormField data-guide="fee-term" label="Term" name="termId" required>
                <USelectMenu v-model="state.termId" value-key="value" :items="terms" placeholder="Select term"
                  :disabled="isLoading" />

                <template #help>
                  <p class="text-xs text-muted">
                    Select the academic term this fee applies to.
                  </p>
                </template>
              </UFormField>

              <!-- Category -->
              <UFormField data-guide="fee-category" label="Fee Category" name="feeCategory" required>
                <USelectMenu v-model="state.feeCategory" value-key="value" :items="categories"
                  placeholder="Select fee category" :disabled="isLoading" />

                <template #help>
                  <p class="text-xs text-muted">
                    Example: Tuition, Exam, PTA or Development.
                  </p>
                </template>
              </UFormField>

              <!-- Amount -->
              <UFormField data-guide="fee-amount" label="Amount" name="amount" required>
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
                <UInput v-model="state.dueDate" type="date"
                  :disabled="isLoading || (state.allowInstallment && state.installments.length > 0)" />

                <template #help>
                  <p class="text-xs text-muted">
                    {{ state.allowInstallment && state.installments.length
                      ? 'Set by the installment plan - the last part is due on this date.'
                      : 'Deadline for completing payment.' }}
                  </p>
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

        <!-- Assignment -->
        <div>
          <UCard class="sticky top-0">
            <div class="space-y-4">
              <!-- Installment -->
              <UFormField data-guide="fee-installment" name="allowInstallment">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium">Allow Installment</p>
                    <p class="text-xs text-muted">Students can pay in parts, optionally on a set plan.</p>
                  </div>

                  <USwitch v-model="state.allowInstallment" :disabled="isLoading" />
                </div>
              </UFormField>

              <FeeStructureInstallmentPlan v-if="state.allowInstallment" v-model="state.installments"
                :amount="state.amount" :term-start="selectedTerm?.startDate" :term-end="selectedTerm?.endDate"
                :year-terms="yearTerms" :disabled="isLoading" />

              <!-- Has Supply -->
              <UFormField v-if="suppliesAvailable" name="hasSupply">
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
              <!-- Assign Mode -->
              <UFormField data-guide="fee-assign" label="Assign To" name="assignMode" required>
                <USelectMenu v-model="state.assignMode" value-key="value" :items="assignModes"
                  placeholder="Select assignment" :disabled="isLoading" />

                <template #help>
                  <p class="text-xs text-muted">
                    Assign this fee to all students, one or more classes, or selected students.
                  </p>
                </template>
              </UFormField>

              <!-- Classes Selector -->
              <UFormField v-if="state.assignMode === 'CLASS'" label="Classes" name="classIds" required>
                <USelectMenu v-model="state.classIds" value-key="value" :items="classes" multiple
                  placeholder="Select one or more classes" :disabled="isLoading" />

                <template #help>
                  <p class="text-xs text-muted">
                    Picking more than one class (e.g. Class 1 and Class 2) creates the same fee
                    independently for each - editing or deleting one later never touches the others.
                  </p>
                </template>
              </UFormField>

              <!-- Stream (streamed classes only) -->
              <UFormField v-if="canPickStream" label="Stream" name="streamId">
                <USelectMenu v-model="state.streamId" value-key="value" :items="streams" placeholder="All Streams"
                  clear :disabled="isLoading" />

                <template #help>
                  <p class="text-xs text-muted">
                    Charge only one stream - e.g. SSS 1 Science priced differently from SSS 1 Art.
                    Create one fee per stream; leave empty to charge every stream the same.
                  </p>
                </template>
              </UFormField>

              <!-- Student Selector -->
              <FeeStructureStudents v-if="state.assignMode === 'SELECTION'" v-model="state.studentIds" />

              <!-- Info -->
              <div v-if="state.assignMode !== 'SELECTION' && state.assignMode !== 'CLASS'"
                class="h-56 border-2 rounded-xl border-gray-200 p-5 flex flex-col text-muted space-y-3 items-center justify-center border-dashed">
                <UIcon :name="FEE_STRUCTURE_ICON" class="w-12 h-12" />

                <p v-if="state.assignMode === 'ALL'" class="text-center">
                  This fee structure will be assigned to all enrolled students.
                </p>

                <p v-else class="text-center">
                  Select how you want to assign this fee structure.
                </p>
              </div>

              <!-- New Students Only -->
              <UFormField v-if="state.assignMode !== 'SELECTION'" name="newStudentsOnly">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium">New Students Only</p>
                    <p class="text-xs text-muted">
                      Only charge students on their first-ever enrollment - not existing students
                      being promoted or re-enrolled. Use this for one-off fees like a Uniform Fee.
                    </p>
                  </div>

                  <USwitch v-model="state.newStudentsOnly" :disabled="isLoading" />
                </div>
              </UFormField>

              <!-- Old Students Only -->
              <UFormField v-if="state.assignMode !== 'SELECTION'" name="oldStudentsOnly">
                <div class="flex justify-between items-start">
                  <div>
                    <p class="font-medium">Old Students Only</p>
                    <p class="text-xs text-muted">
                      Only charge students who are re-enrolling - not students on their
                      first-ever enrollment. Use this for a returning-student fee.
                    </p>
                  </div>

                  <USwitch v-model="state.oldStudentsOnly" :disabled="isLoading" />
                </div>
              </UFormField>

              <!-- Gender -->
              <UFormField v-if="state.assignMode !== 'SELECTION'" label="Gender" name="gender">
                <USelectMenu v-model="state.gender" value-key="value" :items="genderOptions" placeholder="All Genders"
                  clear :disabled="isLoading" />

                <template #help>
                  <p class="text-xs text-muted">
                    Restrict this fee to one gender - e.g. a boys' vs girls' uniform priced
                    differently under two separate fees for the same class/term.
                  </p>
                </template>
              </UFormField>
            </div>
            <template #footer>
              <div class="flex justify-end gap-3">
                <UButton label="Cancel" color="neutral" variant="outline" :disabled="isLoading"
                  to="/fees-payment/structure" />

                <UButton data-guide="fee-save" type="submit" :trailing-icon="SAVE_ICON" label="Create Fee Structure" :loading="isLoading" />
              </div>
            </template>
          </UCard>
        </div>
      </div>
    </UForm>
  </div>
</template>
