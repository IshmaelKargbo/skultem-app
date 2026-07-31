<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import type { Row } from "@tanstack/vue-table";

const route = useRoute();
const router = useRouter();
const store = useBehaviourCategoryStore();
const loading = ref(true);
const { records: data, meta } = storeToRefs(store);
const editRcord = ref<Holiday | null>(null);
const editState = ref(false);

const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");
const scrollContainer = inject<Ref<HTMLElement | null>>("scrollContainer");
const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    id: "actions",
    meta: {
      class: {
        td: "text-right",
      },
    },
    cell: ({ row }) => {
      return h(
        UDropdownMenu,
        {
          content: {
            align: "end",
          },
          size: "sm",
          items: getRowItems(row),
          "aria-label": "Actions dropdown",
        },
        () =>
          h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            size: "sm",
            variant: "ghost",
            "aria-label": "Actions dropdown",
          })
      );
    },
  },
];

function getRowItems(row: Row<Holiday>) {
  return [
    {
      label: "Edit Record",
      icon: "i-lucide-edit",
      onClick: () => {
        editState.value = true;
        editRcord.value = row.original;
      },
    },
    {
      label: "Delete Record",
      icon: "i-lucide-trash",
    },
  ];
}

const page = computed<number>({
  get: () => Number(route.query.page ?? 1),
  set: (val) => updateQuery({ page: val }),
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
  loading.value = true;
  await store.fetchAll(page.value, size.value);
  loading.value = false;
}

watch(
  () => page.value,
  () => {
    nextTick(() => {
      scrollContainer?.value?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
    router.replace({
      query: {
        page: page.value,
        size: size.value,
      },
    });

    fetchRecord();
  },
  { immediate: true }
);

onMounted(async () => {
  if (!route.query.page || !route.query.size) {
    router.replace({
      query: {
        page: page.value,
        size: size.value,
      },
    });
  }

  fetchRecord();
});
</script>

<template>
  <UCard
    :ui="{
      body: 'p-0 sm:p-0',
    }"
    class="hidden md:block"
  >
    <UTable :columns="columns" :data="data" :loading="loading">
      <template #empty-state>
        <div class="flex flex-col items-center gap-2 py-10">
          <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
          <p class="text-gray-500">No behaviour found.</p>
        </div>
      </template>
      <template #loading>
        <TableLoading :size="columns.length" />
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
  <div class="md:hidden bg-gray-100 dark:bg-neutral-950 min-h-[300px]">
    <!-- Loading -->
    <div v-if="loading" class="space-y-3 p-4">
      <div
        v-for="i in 5"
        :key="i"
        class="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
      >
        <div class="flex items-start gap-3">
          <USkeleton class="h-12 w-12 rounded-2xl" />

          <div class="flex-1 space-y-2">
            <USkeleton class="h-4 w-32" />
            <USkeleton class="h-3 w-full" />
            <USkeleton class="h-3 w-2/3" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <Ucard
      v-else-if="!data?.length"
      class="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div
        class="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
      >
        <UIcon name="ph:books-light" class="text-4xl text-gray-400" />
      </div>

      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
        No behaviour found
      </h3>

      <p class="mt-1 max-w-xs text-sm text-gray-500">
        Behaviour categories will appear here once created.
      </p>
    </Ucard>

    <div class="space-y-4">
      <UCard
        v-for="item in data"
        :key="item.id"
        class="group overflow-hidden rounded-[28px] border border-default shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl active:scale-[0.99]"
        :ui="{ body: 'p-0' }"
      >
        <!-- Header -->
        <div class="border-b border-default p-5">
          <div class="flex items-start justify-between gap-4">
            <div class="flex min-w-0 items-center gap-4">
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:bg-primary group-hover:text-white"
              >
                <UIcon
                  name="i-lucide-book-open-text"
                  class="size-5 text-primary group-hover:text-white"
                />
              </div>

              <div class="min-w-0">
                <h3 class="truncate text-base font-semibold">
                  {{ item.name }}
                </h3>

                <div class="mt-1 flex items-center gap-2 text-xs text-muted">
                  <UIcon name="i-lucide-shield-check" class="size-3.5 text-primary" />

                  Behaviour Category
                </div>
              </div>
            </div>

            <UButton
              icon="i-lucide-ellipsis"
              color="neutral"
              variant="ghost"
              square
              class="rounded-xl"
            />
          </div>
        </div>

        <!-- Description -->
        <div class="p-5">
          <div
            class="rounded-2xl border border-default bg-gray-100 p-4 dark:bg-neutral-800"
          >
            <div class="mb-3 flex items-center gap-2">
              <div
                class="flex size-8 items-center justify-center rounded-lg bg-primary/10"
              >
                <UIcon name="i-lucide-file-text" class="size-4 text-primary" />
              </div>

              <span class="text-[11px] font-medium uppercase tracking-wide text-muted">
                Description
              </span>
            </div>

            <p class="text-sm leading-6 text-toned">
              {{ item.description || "No description available." }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between border-t border-default px-5 py-4">
          <div class="flex items-center gap-2">
            <div
              class="flex size-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/15"
            >
              <UIcon
                name="i-lucide-check-circle-2"
                class="size-4 text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div>
              <p class="text-xs font-medium">Active Category</p>

              <p class="text-[11px] text-muted">Available for behaviour records</p>
            </div>
          </div>

          <!-- <UButton
            icon="i-lucide-pencil"
            color="primary"
            variant="soft"
            size="sm"
            class="rounded-xl"
          >
            Edit
          </UButton> -->
        </div>
      </UCard>
    </div>
  </div>
</template>
