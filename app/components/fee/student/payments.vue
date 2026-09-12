<template>
  <UCard
    :ui="embedded ? {
      root: 'ring-0 shadow-none rounded-none bg-transparent border-t border-gray-200 dark:border-gray-800',
      body: 'sm:p-0 p-0',
    } : {
      body: 'sm:p-0 p-0',
    }"
  >
    <template #header>
      <div class="flex justify-between items-center">
        <p>Payment History</p>
        <UBadge variant="outline" :label="`${meta?.total || 0} Payment(s)`" />
      </div>
    </template>
    
    <div v-if="!student" class="p-5">
      <div
        class="border border-dashed flex justify-center flex-col items-center rounded-2xl space-y-5 p-10 h-56 w-full border-blue-300 dark:border-gray-700"
      >
        <UIcon
          class="text-5xl text-gray-300 dark:text-gray-500"
          name="hugeicons:folder-details"
        />
        <p class="text-gray-500 dark:text-gray-400">
          Select a student to view payment history.
        </p>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div v-if="isLoading" class="space-y-3">
        <div class="md:hidden">
          <div v-for="n in 3" :key="n" class="border-b px-4 py-3 border-gray-200 last:border-0">
            <div class="flex items-center justify-between">
              <div class="space-y-2">
                <USkeleton class="h-4 w-32" />
                <USkeleton class="h-3 w-24" />
              </div>
              <div class="space-y-2">
                <div class="flex justify-end">
                  <USkeleton class="h-4 w-16" />
                </div>
                <div class="flex justify-end gap-1">
                  <USkeleton class="h-6 w-6 rounded" />
                  <USkeleton class="h-6 w-6 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="hidden md:block">
          <UTable :columns="columns" :data="[]" :loading="true" />
        </div>
      </div>

      <div v-else-if="records.length === 0" class="p-3">
        <div
          class="text-mute border-2 border-dashed border-gray-100 rounded-xl dark:border-gray-800 flex h-40 w-full justify-center items-center"
        >
          No payments found
        </div>
      </div>

      <div v-else>
        <div class="md:hidden">
          <div
            v-for="item in records"
            :key="item.id"
            class="border-b px-4 py-3 border-gray-200 last:border-0"
          >
            <div class="flex items-center justify-between">
              <div class="min-w-0 space-y-1">
                <h3 class="truncate text-sm font-semibold">
                  {{ paymentMethods[item.paymentMethod]?.label || item.paymentMethod }}
                </h3>
                <div class="flex space-x-2 items-center text-xs text-muted">
                  <p class="truncate">{{ item.referenceNo || "-" }}</p>
                  <p>·</p>
                  <p>{{ formatDateTime(item.paidAt) || "-" }}</p>
                </div>
              </div>

              <div class="space-y-1 text-right">
                <p class="text-sm font-bold text-info">
                  {{ format(item.amount || 0) }}
                </p>
                <div class="flex justify-end gap-1">
                  <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-eye"
                    @click="receiptViewer?.view(item.referenceNo)" />
                  <UButton size="xs" variant="ghost" color="neutral" icon="i-lucide-download"
                    @click="receiptViewer?.download(item.referenceNo)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="hidden md:block">
          <UTable :columns="columns" :data="records" :loading="isLoading">
            <template #empty-state>
              <div class="flex flex-col items-center gap-2 py-10">
                <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
                <p class="text-gray-500">No ledger record found.</p>
              </div>
            </template>
            <template #student-cell="{ row }">
              <div class="flex space-x-3 items-center">
                <div>
                  <UAvatar
                    :src="row.original.student.photo"
                    :alt="row.original.student"
                    loading="lazy"
                  />
                </div>
                <div class="space-y-0.5">
                  <p>{{ row.original.student }}</p>
                  <p class="text-xs text-muted">
                    {{ formatDateTime(row.original.createdAt) }}
                  </p>
                </div>
              </div>
            </template>
            <template #paymentMethod-cell="{ row }">
              <UBadge
                variant="outline"
                :color="paymentMethods[row.original.paymentMethod].color"
                :label="` - ${paymentMethods[row.original.paymentMethod].label}`"
                :icon="paymentMethods[row.original.paymentMethod].icon"
              />
            </template>
            <template #amount-cell="{ row }">
              <p class="font-semibold">{{ format(row.original.amount || 0) }}</p>
            </template>
            <template #referenceNo-cell="{ row }">
              <p class="font-medium">{{ row.original.referenceNo || "-" }}</p>
            </template>
            <template #actions-cell="{ row }">
              <div class="flex justify-end gap-1">
                <UButton size="sm" variant="ghost" color="neutral" icon="i-lucide-eye"
                  @click="receiptViewer?.view(row.original.referenceNo)" />
                <UButton size="sm" variant="ghost" color="neutral" icon="i-lucide-download"
                  @click="receiptViewer?.download(row.original.referenceNo)" />
              </div>
            </template>
            <template #loading>
              <TableLoading :size="columns.length" />
            </template>
          </UTable>
        </div>
      </div>
    </div>

    <ReceiptViewer ref="receiptViewer" />

    <template #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />
        <UPagination
          v-if="meta && !isLoading"
          size="sm"
          v-model:page="page"
          :page-size="meta.size"
          :items-per-page="meta.size"
          :total="meta.total"
          show-edges
        />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
const view = ref<"table" | "card">("table");
const props = defineProps<{
  student: Student | null | undefined;
  embedded?: boolean;
}>();

const store = useStudentStore();
const { format } = useMoney();
const isLoading = ref(false);
const receiptViewer = ref();

const page = ref(1);

const columns = [
  {
    accessorKey: "paidAt",
    header: "Date",
    cell: ({ row }: any) => formatDateTime(row.original.paidAt) || "-",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "paymentMethod",
    header: "Method",
  },
  {
    accessorKey: "referenceNo",
    header: "Reference No",
    cell: ({ row }: any) => row.original.referenceNo || "-",
  },
  {
    id: "actions",
    header: "",
  },
];

const records = ref<FeePayment[]>([]);
const meta = ref<Meta>();
const size = ref(6);

const fetchPayments = async () => {
  if (!props.student) return;
  isLoading.value = true;
  try {
    const res = await store.getPaymentHistoryByStudent(
      props.student.id,
      page.value,
      size.value
    );

    records.value = res?.records || [];
    meta.value = res?.meta;
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => [props.student?.id, page.value],
  async ([studentId, currentPage]) => {
    if (!studentId) return;
    await fetchPayments();
  },
  { immediate: true }
);

watch(
  () => props.student?.id,
  () => {
    page.value = 1;
    records.value = [];
    meta.value = undefined;
  }
);
</script>
