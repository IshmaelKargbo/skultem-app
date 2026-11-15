<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const store = useFeeStructureStore()
const { format } = useMoney()

const fee = ref<FeeStructure>()
const loading = ref(true)
const failed = ref('')
const deleteModal = ref(false)

const id = computed(() => route.params.id as string)

const appliesTo = computed(() => {
  const f = fee.value
  if (!f) return []
  const out: string[] = []
  if (f.newStudentsOnly) out.push('New students only (first-ever enrollment)')
  if (f.oldStudentsOnly) out.push('Re-enrolling students only')
  if (f.gender) out.push(f.gender === 'MALE' ? 'Boys only' : 'Girls only')
  if (f.streamName) out.push(`${f.streamName} stream only`)
  return out
})

async function load() {
  loading.value = true
  failed.value = ''
  try {
    fee.value = await store.getOne(id.value)
    if (fee.value) {
      useAppStore().setTitle(`${clean(fee.value.category.name)} - ${fee.value.term.name}`)
      document.title = `${clean(fee.value.category.name)} | Fee Structure | Fees Payment | Skultem`
    }
  } catch (err: any) {
    failed.value = typeof err === 'string' ? err : (err?.message || 'The fee structure could not be loaded')
  } finally {
    loading.value = false
  }
}

function deleted() {
  router.push('/fees-payment/structure')
}

onMounted(() => {
  useAppStore().setTitle('Fee Structure')
  useAppStore().setBack('/fees-payment/structure')
  load()
})

definePageMeta({
  role: [Role.ACCOUNTANT, Role.PROPRIETOR, Role.OWNER, Role.PRINCIPAL, Role.SUPER_ADMIN]
})
</script>

<template>
  <div class="space-y-4 px-4 md:px-6">
    <div v-if="loading" class="grid gap-4 lg:grid-cols-3">
      <USkeleton class="h-48 w-full rounded-lg lg:col-span-2" />
      <USkeleton class="h-48 w-full rounded-lg" />
    </div>

    <UCard v-else-if="failed || !fee">
      <div class="flex flex-col items-center gap-3 py-8 text-center">
        <UIcon name="i-lucide-circle-alert" class="size-8 text-muted" />
        <p class="text-sm text-muted">{{ failed || 'Fee structure not found.' }}</p>
        <UButton label="Back to fee structures" variant="soft" to="/fees-payment/structure" />
      </div>
    </UCard>

    <template v-else>
      <!-- Header: what it is, how much, and the actions -->
      <UCard>
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div class="min-w-0 space-y-1.5">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="font-display text-xl font-semibold text-highlighted">{{ clean(fee.category.name) }}</h2>
              <UBadge v-if="fee.isSystem" color="neutral" variant="subtle" icon="i-lucide-lock" label="Platform Fee" />
            </div>
            <p class="text-sm text-muted">
              {{ fee.term.name }} · {{ clean(fee.type) }}<template v-if="fee.clazz?.name"> · {{ fee.clazz.name }}</template>
            </p>
            <p class="font-display text-2xl font-semibold text-highlighted">{{ format(fee.amount) }}</p>
          </div>

          <div v-if="!fee.isSystem" class="flex flex-wrap gap-2">
            <UButton :to="`/fees-payment/structure/edit/${fee.id}`" label="Edit" :icon="EDIT_ICON" color="neutral"
              variant="outline" />
            <UButton label="Delete" :icon="DELETE_ICON" color="error" variant="soft" @click="() => { deleteModal = true }" />
          </div>
        </div>
      </UCard>

      <div class="grid gap-4 lg:grid-cols-3">
        <!-- Details -->
        <UCard class="lg:col-span-2">
          <template #header>
            <p class="font-display font-semibold">Details</p>
          </template>
          <dl class="grid gap-3 sm:grid-cols-2">
            <div class="rounded-xl border border-default bg-elevated/40 p-3">
              <dt class="text-xs text-muted">Due date</dt>
              <dd class="mt-1 text-sm font-semibold text-highlighted">{{ fee.dueDate ? formatDate(fee.dueDate) : 'N/A' }}</dd>
            </div>
            <div class="rounded-xl border border-default bg-elevated/40 p-3">
              <dt class="text-xs text-muted">Students charged</dt>
              <dd class="mt-1 text-sm font-semibold text-highlighted">
                <FeeStructureCount :id="fee.id">
                  <template #default="{ value }">{{ value }}</template>
                </FeeStructureCount>
              </dd>
            </div>
            <div class="rounded-xl border border-default bg-elevated/40 p-3 sm:col-span-2">
              <dt class="text-xs text-muted">Who it applies to</dt>
              <dd class="mt-1 text-sm font-semibold text-highlighted">
                <template v-if="appliesTo.length">{{ appliesTo.join(' · ') }}</template>
                <template v-else>Everyone it is assigned to</template>
              </dd>
            </div>
            <div v-if="fee.description" class="rounded-xl border border-default bg-elevated/40 p-3 sm:col-span-2">
              <dt class="text-xs text-muted">Description</dt>
              <dd class="mt-1 whitespace-pre-line text-sm text-highlighted">{{ fee.description }}</dd>
            </div>
            <div class="rounded-xl border border-default bg-elevated/40 p-3 sm:col-span-2">
              <dt class="text-xs text-muted">Material supply</dt>
              <dd class="mt-1 text-sm text-highlighted">
                <ul v-if="fee.hasSupply && fee.supplyItems?.length" class="space-y-0.5">
                  <li v-for="item in fee.supplyItems" :key="item.material.name" class="font-medium">
                    {{ item.material.name }} <span class="text-muted">× {{ item.quantity }}</span>
                  </li>
                </ul>
                <span v-else class="text-muted">No supply attached</span>
              </dd>
            </div>
          </dl>
        </UCard>

        <!-- Payment plan -->
        <UCard>
          <template #header>
            <p class="font-display font-semibold">Payment plan</p>
          </template>
          <div v-if="fee.installments?.length" class="divide-y divide-default">
            <div v-for="(part, i) in fee.installments" :key="i" class="flex items-start justify-between gap-3 py-2 text-sm">
              <div class="min-w-0">
                <p class="font-medium text-highlighted">{{ part.label || `Part ${i + 1}` }}</p>
                <p class="text-xs text-muted">Due {{ part.dueDate ? formatDate(part.dueDate) : 'N/A' }}</p>
              </div>
              <p class="shrink-0 font-semibold text-highlighted">{{ format(part.amount) }}</p>
            </div>
          </div>
          <p v-else class="text-sm text-muted">
            {{ fee.allowInstallment ? 'Can be paid in parts, with no set plan.' : 'Paid in full - no installments.' }}
          </p>
        </UCard>
      </div>

      <FeeStructureDeletePrompt v-if="!fee.isSystem" v-model:open="deleteModal" :fee-id="fee.id"
        :fee-name="`${clean(fee.category.name)} - ${fee.term.name}`" @deleted="deleted" />
    </template>
  </div>
</template>
