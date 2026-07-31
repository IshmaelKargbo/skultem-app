<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const store = useStudentStore();
const { records: data, meta, loading } = storeToRefs(store);

const parseStaus: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  DELETED: "Deleted",
};

const parseStatusColor: Record<string, string> = {
  ACTIVE: "success",
  INACTIVE: "warning",
  DELETED: "danger",
};

const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: any) => {
      return `${row.original.givenNames} ${row.original.familyName}`;
    },
  },
  {
    accessorKey: "dateOfBirth",
    header: "Date of Birth",
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "className",
    header: "Class",
  },
  {
    accessorKey: "parent",
    header: "Guardian",
  },
  {
    id: "actions",
    meta: {
      class: {
        td: "text-right",
      },
    },
  },
];

function view(row: Student) {
  router.push(`/students/${row.id}`);
}

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val }),
});

const search = computed<string>({
  get: () => String(route.query.search ?? ""),
  set: (val) => updateQuery({ search: val }),
});

const size = computed<number>({
  get: () => Number(route.query.size ?? runtimeConf().limit),
  set: (val) => updateQuery({ size: val }),
});

function updateQuery(newQuery: Record<string, any>) {
  const merged = { ...route.query, ...newQuery };

  if (merged.page === route.query.page && merged.size === route.query.size) {
    return;
  }

  router.replace({ query: merged });
}

async function fetchRecord() {
  await store.fetchAll(page.value, size.value, search.value);
}

watch(
  () => page.value,
  () => {
    router.replace({
      query: {
        page: page.value,
      },
    });

    fetchRecord();
  },
  { immediate: true }
);

watch(
  () => search.value,
  () => {
    router.replace({
      query: {
        search: search.value || undefined,
      },
    });

    fetchRecord();
  }
);

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
        search: search.value || undefined,
      },
    });
  }

  fetchRecord();
});
</script>

<template>
  <UCard class="hidden md:block" :ui="{ body: 'p-0 sm:p-0' }">
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon
            name="ph:books-light"
            class="text-4xl text-gray-400 dark:text-gray-500"
          />
          <p class="text-gray-500 dark:text-gray-400">No students found.</p>
        </div>
      </template>
      <template #parent-cell="{ row }">
        <p>
          {{ row.original.guardian?.givenNames }} {{ row.original.guardian?.familyName }}
        </p>
      </template>
      <template #gender-cell="{ row }">
        <UBadge
          :label="parseGender[row.original.gender]"
          :color="parseGenderColor[row.original.gender]"
          variant="outline"
        />
      </template>
      <template #name-cell="{ row }">
        <StudentIdentityCell
          :given-names="row.original.givenNames"
          :family-name="row.original.familyName"
          :photo="row.original.photo"
          :subtitle="`${row.original.admissionNumber || 'No Admission No'}`"
        />
      </template>
      <template #loading>
        <TableLoading :size="columns.length" />
      </template>
      <template #actions-cell="{ row }">
        <div>
          <UButton
            @click="view(row.original)"
            size="sm"
            variant="ghost"
            color="success"
            class="cursor-pointer"
            :icon="VIEW_ICON"
          />
        </div>
      </template>
    </UTable>
    <template #footer>
      <div class="flex justify-between items-center">
        <Showing :meta="meta" />
        <UPagination
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

  <!-- Mobile -->
  <div class="space-y-4 md:hidden">
    <!-- Loading -->
    <template v-if="loading">
      <UCard v-for="i in 6" :key="i" class="overflow-hidden" :ui="{ body: 'p-0' }">
        <!-- Header -->
        <div class="border-b border-gray-100 p-4 dark:border-gray-800">
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <USkeleton class="size-12 rounded-xl" />

              <div class="space-y-2">
                <USkeleton class="h-4 w-36 rounded-md" />
                <USkeleton class="h-3 w-28 rounded-md" />
              </div>
            </div>

            <USkeleton class="h-6 w-16 rounded-full" />
          </div>
        </div>

        <!-- Information -->
        <div class="grid grid-cols-2 gap-3 p-4">
          <div
            v-for="j in 4"
            :key="j"
            class="rounded-2xl bg-gray-100 p-3 dark:bg-neutral-800"
          >
            <div class="mb-2 flex items-center gap-2">
              <USkeleton class="size-7 rounded-lg" />
              <USkeleton class="h-3 w-16 rounded" />
            </div>

            <USkeleton class="h-5 w-24 rounded-md" />
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-gray-800"
        >
          <div class="flex items-center gap-3">
            <USkeleton class="size-10 rounded-full" />

            <div class="space-y-2">
              <USkeleton class="h-4 w-28 rounded-md" />
              <USkeleton class="h-3 w-20 rounded-md" />
            </div>
          </div>

          <USkeleton class="h-9 w-20 rounded-xl" />
        </div>
      </UCard>
    </template>
    <!-- Data -->
    <template v-else-if="data?.length">
      <UCard
        v-for="item in data"
        :key="item.id"
        class="overflow-hidden transition-all active:scale-[0.99]"
        :ui="{
          body: 'p-0',
        }"
      >
        <!-- Header -->
        <div class="border-b border-gray-100 p-4 dark:border-gray-800">
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <UAvatar
                size="xl"
                :src="item.photo || '/avatar-placeholder.svg'"
                :alt="`${item.givenNames} ${item.familyName}`"
              />

              <div class="min-w-0">
                <h3 class=" text-base font-bold text-gray-900 dark:text-white">
                  {{ item.givenNames }} {{ item.familyName }}
                </h3>

                <div class="mt-1 flex items-center gap-1 text-xs text-gray-500">
                  <span>
                    {{ item.admissionNumber || "No Admission No" }}
                  </span>

                  <span>•</span>

                  <span>
                    {{ item.className || "No Class" }}
                  </span>
                </div>
              </div>
            </div>

            <UBadge
              :label="parseStaus[item.status]"
              :color="parseStatusColor[item.status]"
              variant="soft"
            />
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-3 p-4">
          <!-- Gender -->
          <div
            class="min-w-0 rounded-2xl border p-3"
            :class="
              item.gender === 'MALE'
                ? 'border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10'
                : item.gender === 'FEMALE'
                ? 'border-pink-200 bg-pink-50 dark:border-pink-500/20 dark:bg-pink-500/10'
                : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
            "
          >
            <div class="mb-2 flex items-center gap-2">
              <div
                class="flex size-7 items-center justify-center rounded-lg"
                :class="
                  item.gender === 'MALE'
                    ? 'bg-blue-100 dark:bg-blue-500/20'
                    : item.gender === 'FEMALE'
                    ? 'bg-pink-100 dark:bg-pink-500/20'
                    : 'bg-gray-200 dark:bg-gray-700'
                "
              >
                <UIcon
                  name="i-lucide-users"
                  class="size-4"
                  :class="
                    item.gender === 'MALE'
                      ? 'text-blue-600 dark:text-blue-400'
                      : item.gender === 'FEMALE'
                      ? 'text-pink-600 dark:text-pink-400'
                      : 'text-gray-600 dark:text-gray-400'
                  "
                />
              </div>

              <p
                class="text-[10px] font-medium uppercase tracking-wide"
                :class="
                  item.gender === 'MALE'
                    ? 'text-blue-700 dark:text-blue-300'
                    : item.gender === 'FEMALE'
                    ? 'text-pink-700 dark:text-pink-300'
                    : 'text-gray-600 dark:text-gray-400'
                "
              >
                Gender
              </p>
            </div>

            <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
              {{ parseGender[item.gender] }}
            </p>
          </div>

          <!-- Date of Birth -->
          <div
            class="min-w-0 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-500/20 dark:bg-amber-500/10"
          >
            <div class="mb-2 flex items-center gap-2">
              <div
                class="flex size-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20"
              >
                <UIcon
                  name="i-lucide-calendar-days"
                  class="size-4 text-amber-600 dark:text-amber-400"
                />
              </div>

              <p
                class="text-[10px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300"
              >
                Date of Birth
              </p>
            </div>

            <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
              {{ formatDate(item.dateOfBirth) }}
            </p>
          </div>

          <!-- Guardian -->
          <div
            class="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/10"
          >
            <div class="mb-2 flex items-center gap-2">
              <div
                class="flex size-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20"
              >
                <UIcon
                  name="i-lucide-user-round"
                  class="size-4 text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <p
                class="text-[10px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
              >
                Guardian
              </p>
            </div>

            <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
              {{ item.guardian?.givenNames }}
              {{ item.guardian?.familyName }}
            </p>
          </div>

          <!-- Class -->
          <div
            class="min-w-0 rounded-2xl border border-violet-200 bg-violet-50 p-3 dark:border-violet-500/20 dark:bg-violet-500/10"
          >
            <div class="mb-2 flex items-center gap-2">
              <div
                class="flex size-7 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-500/20"
              >
                <UIcon
                  name="i-lucide-school"
                  class="size-4 text-violet-600 dark:text-violet-400"
                />
              </div>

              <p
                class="text-[10px] font-medium uppercase tracking-wide text-violet-700 dark:text-violet-300"
              >
                Class
              </p>
            </div>

            <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
              {{ item.className || "N/A" }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-gray-800"
        >
          <div class="flex min-w-0 items-center gap-3">
            <UAvatar size="md" icon="i-lucide-users" />

            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-gray-900 dark:text-white">
                {{ item.family?.fatherName || "No Father Name" }}
              </p>

              <p class="truncate text-xs text-gray-500">
                {{ item.family?.motherName || "No Mother Name" }}
              </p>
            </div>
          </div>

          <UButton
            @click="view(item)"
            label="View"
            trailing-icon="i-lucide-chevron-right"
            color="neutral"
            variant="ghost"
            size="sm"
            class="rounded-xl"
          />
        </div>
      </UCard>
    </template>

    <!-- Empty -->
    <template v-else>
      <UCard>
        <div class="flex flex-col items-center justify-center py-14">
          <UIcon
            name="ph:books-light"
            class="mb-3 text-4xl text-gray-400 dark:text-gray-500"
          />

          <p class="text-sm text-gray-500 dark:text-gray-400">No students found.</p>
        </div>
      </UCard>
    </template>

    <!-- Pagination -->
    <div v-if="!loading && data?.length" class="flex flex-col items-center gap-3 pt-2">
      <Showing :meta="meta" />
      <UPagination
        size="sm"
        v-model:page="page"
        :page-size="meta.size"
        :items-per-page="meta.size"
        :total="meta.total"
        show-edges
      />
    </div>
  </div>
</template>
