<template>
  <div class="space-y-4 px-4 md:px-6">
    <FeeSectionNav />

    <Heading title="Create Discount"
      subtitle="Apply one discount to a student across several fees, e.g. first and second term school fees.">
      <UButton variant="soft" color="neutral" to="/fees-payment/discounts" label="Cancel" :disabled="isLoading" />
      <UButton icon="lucide:save" :loading="isLoading" label="Save Discount" @click="formRef?.submit()" />
    </Heading>

    <UForm ref="formRef" :schema="schema" :state="state" class="grid items-start gap-4 lg:grid-cols-3"
      @submit="onSubmit">

      <!-- Left: the form -->
      <div class="space-y-4 lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-user-round" class="text-primary" />
              <span class="font-semibold">Student &amp; fees</span>
            </div>
          </template>

          <div class="grid gap-5 md:grid-cols-2">
            <UFormField label="Discount Name" name="name" required class="md:col-span-2">
              <UInput v-model="state.name" icon="i-lucide-tag" class="w-full"
                placeholder="e.g. Scholarship - Medisha Kargbo" />
              <template #help>
                <p class="text-xs text-muted">A descriptive name. One discount covers all the fees you select below.</p>
              </template>
            </UFormField>

            <UFormField v-if="!lockedStudent" label="Student" name="studentId" required class="md:col-span-2">
              <USelectMenu v-model="state.studentId" value-key="value" :items="students"
                v-model:search-term="studentSearchTerm" :loading="studentsLoading" ignore-filter
                placeholder="Search and select student" icon="i-lucide-user" class="w-full"
                :disabled="isLoading" @update:model-value="onStudentChange" />
            </UFormField>

            <UFormField v-else label="Student" class="md:col-span-2">
              <UInput :model-value="lockedStudentName" icon="i-lucide-user" disabled class="w-full" />
            </UFormField>

            <UFormField label="Fees" name="feeIds" required class="md:col-span-2">
              <USelectMenu v-model="state.feeIds" multiple value-key="value" :items="categories" class="w-full"
                :placeholder="state.studentId ? 'Select one or more fees' : 'Select a student first'"
                icon="i-lucide-wallet" :disabled="isLoading || !state.studentId" />
              <template #help>
                <p class="text-xs text-muted">
                  Pick every fee this discount applies to, e.g. First Term and Second Term School Fees.
                </p>
              </template>
            </UFormField>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-badge-percent" class="text-primary" />
              <span class="font-semibold">Discount details</span>
            </div>
          </template>

          <div class="grid gap-5 md:grid-cols-2">
            <UFormField label="Type" name="kind" required>
              <USelect v-model="state.kind" :items="kindOptions" placeholder="Select discount type"
                leading-icon="i-lucide-badge-percent" class="w-full" @change="kindChange" />
              <template #help>
                <p class="text-xs text-muted">Fixed amount, or a percentage of each fee.</p>
              </template>
            </UFormField>

            <UFormField label="Default value" name="value" required>
              <UInput v-model="state.value" type="number" class="w-full"
                :icon="state.kind === 'PERCENTAGE' ? 'i-lucide-percent' : 'i-lucide-banknote'"
                placeholder="Enter discount value" :disabled="isLoading" @input="handleAmountInput" />
              <template #help>
                <p class="text-xs text-muted">
                  {{ state.kind === 'PERCENTAGE' ? 'A number between 1 and 100.' : 'A fixed amount.' }} Used for every fee unless you change it below.
                </p>
              </template>
            </UFormField>

            <UFormField label="Expiry Date" name="expiryDate" required>
              <UInput v-model="state.expiryDate" type="date" icon="i-lucide-calendar-days" class="w-full"
                :disabled="isLoading" />
              <template #help>
                <p class="text-xs text-muted">After this date the discount is no longer valid.</p>
              </template>
            </UFormField>

            <UFormField label="Reason" name="reason" required>
              <UInput v-model="state.reason" icon="i-lucide-file-text" class="w-full"
                placeholder="e.g. Scholarship award" :disabled="isLoading" />
              <template #help>
                <p class="text-xs text-muted">Why this discount is being given.</p>
              </template>
            </UFormField>
          </div>

          <!-- Per-fee values -->
          <div v-if="selectedFees.length" class="mt-6 space-y-3 border-t border-default pt-5">
            <div>
              <p class="text-sm font-semibold">Value per fee</p>
              <p class="text-xs text-muted">
                Every fee starts at the default value. Change a fee to give it a different
                {{ state.kind === 'PERCENTAGE' ? 'percentage (e.g. 100% on three fees and 50% on one)' : 'amount' }}.
              </p>
            </div>

            <div v-for="f in selectedFees" :key="f.feeId"
              class="grid items-center gap-3 rounded-md border border-default p-3 sm:grid-cols-[1fr_11rem]">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium">{{ feeLabel(f) }}</p>
                <p class="text-xs text-muted">Outstanding {{ format(Number(f.outstanding)) }}</p>
              </div>
              <UInput :model-value="valueFor(f.feeId) ?? undefined" type="number" class="w-full"
                :icon="state.kind === 'PERCENTAGE' ? 'i-lucide-percent' : 'i-lucide-banknote'"
                :placeholder="state.value ? String(state.value) : 'Value'" :disabled="isLoading"
                @update:model-value="setOverride(f, $event)" />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Right: live summary -->
      <div class="lg:sticky lg:top-6">
        <UCard class="overflow-hidden" :ui="{ body: 'p-0 sm:p-0' }">
          <div class="bg-primary p-6 text-center text-inverted">
            <p class="text-sm opacity-80">Total discount</p>
            <h1 class="mt-3 text-4xl font-bold">{{ format(summary.totalDiscount) }}</h1>
            <p class="mt-2 text-xs opacity-75">
              {{ selectedFees.length }} fee{{ selectedFees.length === 1 ? '' : 's' }} selected
            </p>
          </div>

          <div class="space-y-4 p-4 text-sm">
            <div class="flex justify-between gap-3">
              <span class="text-muted">Student</span>
              <span class="truncate font-medium">{{ studentLabel }}</span>
            </div>

            <div v-if="!selectedFees.length" class="rounded-md border border-dashed border-default p-4 text-center text-muted">
              Select a student and fees to preview the discount.
            </div>

            <template v-else>
              <div class="space-y-3">
                <div v-for="r in summary.rows" :key="r.id" class="rounded-md border border-default p-3">
                  <p class="truncate font-medium">{{ r.label }}</p>
                  <div class="mt-2 space-y-1 text-xs">
                    <div class="flex justify-between"><span class="text-muted">Outstanding</span><span>{{ format(r.outstanding) }}</span></div>
                    <div class="flex justify-between"><span class="text-muted">Discount</span><span class="text-success">- {{ format(r.discount) }}</span></div>
                    <div class="flex justify-between font-semibold"><span>New balance</span><span>{{ format(r.remaining) }}</span></div>
                  </div>
                </div>
              </div>

              <div class="flex justify-between border-t border-default pt-3 font-semibold">
                <span>Balance after discount</span>
                <span>{{ format(summary.totalRemaining) }}</span>
              </div>
            </template>
          </div>
        </UCard>
      </div>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import * as yup from "yup";
import { reactive, ref, computed } from "vue";
import type { FormSubmitEvent } from "#ui/types";
const { format } = useMoney();
const store = useFeeDiscountStore();
const toast = useToast();
const route = useRoute();
const router = useRouter();

// Opened from a student's fee record: the student is fixed and shown read-only.
const lockedStudent = computed(() => (route.query.studentId as string) || "");
const lockedStudentName = computed(() => (route.query.name as string) || "Selected student");

const isLoading = ref(false);
const formRef = ref<any>(null);

const feeLabel = (f: StudentFee) => (f.term ? `${f.term} · ${f.feeName}` : f.feeName);

const selectedFees = computed(() => fees.value.filter((f) => state.feeIds.includes(f.feeId)));

// A fee follows the default value until it is given one of its own.
const overrides = reactive<Record<string, number>>({});

function valueFor(feeId: string): number | null {
  return overrides[feeId] ?? state.value;
}

function maxFor(outstanding: number) {
  return state.kind === "PERCENTAGE" ? 100 : outstanding;
}

function setOverride(f: StudentFee, raw: unknown) {
  if (raw === "" || raw === null || raw === undefined) {
    delete overrides[f.feeId];
    return;
  }
  const n = Number(raw);
  if (isNaN(n)) return;
  overrides[f.feeId] = Math.min(Math.max(n, 0), maxFor(Number(f.outstanding)));
}

function discountOn(feeId: string, outstanding: number) {
  const value = Number(valueFor(feeId) || 0);
  return state.kind == "PERCENTAGE" ? (value / 100) * outstanding : value;
}

const summary = computed(() => {
  const rows = selectedFees.value.map((f) => {
    const outstanding = Number(f.outstanding);
    const discount = Math.min(discountOn(f.feeId, outstanding), outstanding);
    return { id: f.feeId, label: feeLabel(f), outstanding, discount, remaining: outstanding - discount };
  });
  return {
    rows,
    totalDiscount: rows.reduce((a, r) => a + r.discount, 0),
    totalRemaining: rows.reduce((a, r) => a + r.remaining, 0),
  };
});

const studentLabel = computed(() =>
  lockedStudent.value
    ? lockedStudentName.value
    : students.value.find((s) => s.value === state.studentId)?.label || "Not selected"
);

const kindOptions = [
  { label: "Percentage", value: "PERCENTAGE" },
  { label: "Fixed Amount", value: "AMOUNT" },
];

function handleAmountInput(event: any) {
  if (state.kind == "PERCENTAGE") {
    let value = Number(event.target.value);

    if (isNaN(value)) {
      state.value = null;
      return;
    }

    if (value > 100) {
      value = 100;
    }

    state.value = value;

    event.target.value = value;
    return;
  }

  // Fixed amounts are capped per fee (see setOverride / submit), not here.
  const value = Number(event.target.value);
  state.value = isNaN(value) ? null : Math.max(value, 0);
}

function kindChange() {
  Object.keys(overrides).forEach((k) => delete overrides[k]);
  if (state.kind != "PERCENTAGE") return;
  let value = state.value || 0;

  if (value > 100) {
    state.value = 100;
  }
}

const fees = ref<StudentFee[]>([]);

const categories = ref<{ label: string; value: string; outstanding: string; total: string; name: string }[]>([]);

function onStudentChange() {
  state.feeIds = [];
  Object.keys(overrides).forEach((k) => delete overrides[k]);
  fetchRecords();
}

async function fetchRecords() {
  try {
    if (!state.studentId) return;
    const result = await useStudentStore().getAllStudentOutstandingFeesById(
      state.studentId
    );

    if (result == null) return;

    fees.value = result;
    categories.value = result.map((s: StudentFee) => ({
      label: `${s.term ? s.term + ' · ' : ''}${s.feeName} (${format(s.total)}) - ${format(s.outstanding)}`,
      outstanding: s.outstanding,
      total: s.total,
      name: s.feeName,
      value: s.feeId,
    })) || [];

  } catch (err) {
    categories.value = [];
  }
}

// Students are searched on the server (25 at a time) as the user types - the whole roster is never
// loaded or filtered in the browser. The picked student is remembered so the menu keeps showing their
// name after the list is replaced by a new search.
const studentSearchTerm = ref("");
const studentsLoading = ref(false);
const foundStudents = ref<{ label: string; value: string }[]>([]);
const pickedStudent = ref<{ label: string; value: string } | null>(null);

const students = computed(() => {
  const picked = pickedStudent.value;
  return picked && picked.value === state.studentId && !foundStudents.value.some((s) => s.value === picked.value)
    ? [picked, ...foundStudents.value]
    : foundStudents.value;
});

let studentRequest = 0;
async function searchStudents(term: string) {
  const id = ++studentRequest;
  studentsLoading.value = true;
  try {
    const res = (await StudentApi().getAll(term.trim(), 1, 25)) as any;
    if (id !== studentRequest) return;
    foundStudents.value = (res?.data || []).map((x: Student) => ({
      label: `${x.givenNames} ${x.familyName}`,
      value: x.id,
    }));
  } finally {
    if (id === studentRequest) studentsLoading.value = false;
  }
}

let studentTimer: ReturnType<typeof setTimeout>;
watch(studentSearchTerm, (term) => {
  clearTimeout(studentTimer);
  studentTimer = setTimeout(() => searchStudents(term), 300);
});
onBeforeUnmount(() => clearTimeout(studentTimer));

onMounted(() => {
  if (!lockedStudent.value) searchStudents("");
});

type FeeDiscountForm = {
  studentId: string;
  feeIds: string[];
  name: string;
  kind: string;
  value: number | null;
  expiryDate: string;
  reason: string;
};

const state = reactive<FeeDiscountForm>({
  name: "",
  expiryDate: "",
  value: null,
  feeIds: [],
  kind: "",
  reason: "",
  studentId: "",
});

watch(
  () => state.studentId,
  (id) => {
    const found = foundStudents.value.find((x) => x.value === id);
    if (found) pickedStudent.value = found;
  }
);

const schema = yup.object({
  studentId: yup.string().required("Student is required"),
  feeIds: yup.array().of(yup.string().required()).min(1, "Select at least one fee").required("Select at least one fee"),
  kind: yup.string().required("Type is required"),
  value: yup
    .number()
    .typeError("Value must be a number")
    .required("Value is required")
    .positive("Value must be greater than 0")
    .when("kind", {
      is: (val: string) => ["PERCENTAGE"].includes(val),
      then: (schema) => schema
        .required("Reference number is required for this payment method")
        .min(1, "Percentage min is 1")
        .max(100, "Percentage max is 100"),
      otherwise: (schema) => schema.optional().nullable(),
    }),
  expiryDate: yup.string().required("Expiry date is required"),
  reason: yup.string().required("Reason is required"),
});

const close = () => {
  router.push("/fees-payment/discounts");
};

const onSubmit = async (_event: FormSubmitEvent<FeeDiscountForm>) => {
  isLoading.value = true;

  try {
    await schema.validate(state, { abortEarly: false });

    for (const f of selectedFees.value) {
      const v = Number(valueFor(f.feeId));
      if (!v || v <= 0) throw new Error(`Enter a value for ${feeLabel(f)}`);
      if (state.kind === "PERCENTAGE" && (v < 1 || v > 100)) throw new Error(`${feeLabel(f)}: percentage must be between 1 and 100`);
      if (state.kind !== "PERCENTAGE" && v > Number(f.outstanding)) throw new Error(`${feeLabel(f)}: discount is more than the outstanding balance`);
    }

    await store.create({
      expiryDate: state.expiryDate,
      fees: selectedFees.value.map((f) => ({ feeId: f.feeId, value: Number(valueFor(f.feeId)) })),
      kind: state.kind,
      name: state.name,
      reason: state.reason,
      studentId: state.studentId,
    });


    toast.add({
      description: "Fee discount created successfully",
      color: "success",
    });

    close();
  } catch (err: any) {
    toast.add({
      description: err.errors?.[0] || err.message,
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  useAppStore().setTitle("Create Discount");
  document.title = "Create Discount | Fees Payment | Skultem";

  if (lockedStudent.value) {
    state.studentId = lockedStudent.value;
    await fetchRecords();
  }
});

definePageMeta({
  role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN],
});
</script>
