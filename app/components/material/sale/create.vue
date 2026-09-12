<script setup lang="ts">
import * as yup from 'yup'

const emit = defineEmits<{ (e: 'success'): void }>()

const { success: toastSuccess, error: toastError } = useNotify()
const { format } = useMoney()

const materialStore = useMaterialStore()
const saleStore = useMaterialSaleStore()
const { records: materials } = storeToRefs(materialStore)

const formRef = ref()
const isLoading = ref(false)
const open = ref(false)

const methodOptions = [
    { label: 'Cash', value: 'CASH' },
    { label: 'Bank Transfer', value: 'BANK' },
    { label: 'Mobile Money', value: 'MOBILE_MONEY' }
]

function defaultState() {
    return {
        buyerType: 'student' as 'student' | 'walkin',
        studentId: '',
        customerName: '',
        materialId: '',
        quantity: 1,
        unitPrice: 0,
        amountPaid: 0,
        paymentMethod: '',
        note: '',
        // Whether the buyer is taking the item away right now - independent of stock: someone can
        // pay today and still ask to collect later even for something sitting on the shelf. Only
        // matters when there's actually stock to hand over (see isPreSale) - out of stock is
        // always "collect later" regardless of this.
        collectNow: true
    }
}

const state = reactive(defaultState())

const { searchTerm: studentSearchTerm, students, loading: studentsLoading } = useStudentSearch()

const materialOptions = computed(() =>
    materials.value.map(m => ({
        label: `${m.name} · ${m.inStock} ${unitLabelMap[m.unit] ?? m.unit} in stock · ${format(m.price)}`,
        value: m.id
    }))
)

const selectedMaterial = computed(() => materials.value.find(m => m.id === state.materialId))

// Pre-fill from the material's catalog price so staff aren't re-typing (and risking a typo on)
// the same price every time it's sold - still just a starting point, editable below.
watch(() => state.materialId, () => {
    if (selectedMaterial.value) state.unitPrice = Number(selectedMaterial.value.price || 0)
})

const totalAmount = computed(() => Number(state.quantity || 0) * Number(state.unitPrice || 0))

const balance = computed(() => Math.max(0, totalAmount.value - Number(state.amountPaid || 0)))

// Not enough on the shelf right now -> this will be recorded as a pre-sale ("settle later")
// instead of handing the item over immediately.
const isPreSale = computed(() => {
    if (!selectedMaterial.value) return false
    return Number(state.quantity || 0) > Number(selectedMaterial.value.inStock)
})

// Handing over the item requires the balance to actually be zero - a partial payment should never
// leave with the merchandise no matter how eager the buyer is to "collect now". Backend enforces
// this independently too; this just keeps the toggle from offering a choice that isn't real.
const isFullyPaid = computed(() => totalAmount.value > 0 && Number(state.amountPaid || 0) >= totalAmount.value)

watch(isFullyPaid, (fullyPaid) => {
    if (!fullyPaid) state.collectNow = false
})

function markFullyPaid() {
    state.amountPaid = totalAmount.value
}

const schema = yup.object({
    materialId: yup.string().required('Please select a material'),

    studentId: yup.string().when('buyerType', {
        is: 'student',
        then: s => s.required('Please select a student')
    }),

    customerName: yup.string().when('buyerType', {
        is: 'walkin',
        then: s => s.required('Please enter the customer\'s name')
    }),

    quantity: yup.number().min(1, 'Must be at least 1').required('Quantity is required'),

    unitPrice: yup.number().min(0, 'Cannot be negative').required('Unit price is required'),

    amountPaid: yup
        .number()
        .min(0, 'Cannot be negative')
        .test('max-total', 'Cannot exceed the total amount', value => !value || value <= totalAmount.value)
        .optional(),

    paymentMethod: yup.string().when('amountPaid', {
        is: (v: number) => Number(v) > 0,
        then: s => s.required('Select how the payment was made')
    }),

    note: yup.string().optional()
})

function close() {
    open.value = false
    Object.assign(state, defaultState())
}

async function onSubmit() {
    try {
        isLoading.value = true

        await saleStore.create({
            materialId: state.materialId,
            studentId: state.buyerType === 'student' ? state.studentId : undefined,
            customerName: state.buyerType === 'walkin' ? state.customerName : undefined,
            quantity: Number(state.quantity),
            unitPrice: Number(state.unitPrice),
            amountPaid: Number(state.amountPaid || 0),
            paymentMethod: Number(state.amountPaid) > 0 ? state.paymentMethod : undefined,
            note: state.note || undefined,
            collectNow: state.collectNow
        })

        await saleStore.fetchSummary()

        let message = 'Sale recorded successfully'
        if (isPreSale.value) {
            message = 'Sale recorded as a pre-sale - settle it once the item is restocked'
        } else if (!isFullyPaid.value) {
            message = 'Sale recorded - settle the balance before it can be collected'
        } else if (!state.collectNow) {
            message = 'Sale recorded - marked to settle once collected'
        }
        toastSuccess(message)

        emit('success')
        close()
    } catch (error: any) {
        toastError(error?.message || 'Failed to record sale')
    } finally {
        isLoading.value = false
    }
}

// This button+slideover sits unconditionally in the sales list's header, so it mounts (and this
// setup() runs) on every visit to the page - fetching the full material catalog here unconditionally
// meant every page load paid for it before anyone even asked to record a sale. Load it only when
// the slideover is actually opened, and only once.
watch(open, (isOpen) => {
    if (isOpen && !materials.value.length) materialStore.fetchAll(1, 0)
})
</script>

<template>
    <USlideover :dismissible="false" :open="open" @update:open="open = $event">
        <UButton color="primary" label="New Sale" :icon="SALE_ICON" @click="open = true" />

        <!-- Header -->
        <template #header>
            <div class="flex items-center justify-between w-full">
                <p class="text-lg font-semibold">Record a Sale</p>
                <UButton :icon="CLOSE_ICON" variant="ghost" @click="close" />
            </div>
        </template>

        <!-- Body -->
        <template #body>
            <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4"
                @submit="onSubmit">

                <!-- Buyer type -->
                <UFormField label="Buyer" required>
                    <div class="grid grid-cols-2 gap-2">
                        <UButton
                            :color="state.buyerType === 'student' ? 'primary' : 'neutral'"
                            :variant="state.buyerType === 'student' ? 'solid' : 'soft'"
                            :icon="STUDENT_ICON"
                            label="Student"
                            block
                            @click="state.buyerType = 'student'"
                        />
                        <UButton
                            :color="state.buyerType === 'walkin' ? 'primary' : 'neutral'"
                            :variant="state.buyerType === 'walkin' ? 'solid' : 'soft'"
                            icon="i-lucide-user-round"
                            label="Walk-in Customer"
                            block
                            @click="state.buyerType = 'walkin'"
                        />
                    </div>
                </UFormField>

                <!-- Student -->
                <UFormField v-if="state.buyerType === 'student'" label="Student" name="studentId" required>
                    <USelectMenu v-model="state.studentId" v-model:search-term="studentSearchTerm"
                        :items="students" :loading="studentsLoading" value-key="value" ignore-filter
                        placeholder="Search for a student" class="w-full" />
                </UFormField>

                <!-- Walk-in -->
                <UFormField v-else label="Customer Name" name="customerName" required>
                    <UInput v-model="state.customerName" placeholder="e.g. Mrs. Kamara (parent)" class="w-full" />
                </UFormField>

                <!-- Material -->
                <UFormField label="Material" name="materialId" required>
                    <USelectMenu v-model="state.materialId" :items="materialOptions" value-key="value"
                        placeholder="Select material" class="w-full" />
                </UFormField>

                <div class="grid grid-cols-2 gap-4">
                    <!-- Quantity -->
                    <UFormField label="Quantity" name="quantity" required>
                        <UInput v-model.number="state.quantity" type="number" min="1" class="w-full" />
                    </UFormField>

                    <!-- Unit Price -->
                    <UFormField label="Unit Price" name="unitPrice" required>
                        <UInput v-model.number="state.unitPrice" type="number" min="0" step="0.01" class="w-full" />
                    </UFormField>
                </div>

                <!-- Pre-sale notice -->
                <UAlert
                    v-if="isPreSale"
                    color="warning"
                    variant="soft"
                    :icon="PRE_SALE_ICON"
                    title="Not enough stock yet"
                    :description="`Only ${selectedMaterial?.inStock ?? 0} of ${selectedMaterial?.name} left. This sale will be recorded as a pre-sale to settle later, once it's restocked.`"
                />

                <!-- Totals -->
                <div class="rounded-xl bg-gray-50 dark:bg-gray-900 p-3 space-y-1.5 text-sm">
                    <div class="flex justify-between">
                        <span class="text-muted">Total Amount</span>
                        <span class="font-semibold">{{ format(totalAmount) }}</span>
                    </div>
                </div>

                <!-- Amount Paid -->
                <UFormField label="Amount Paid" name="amountPaid">
                    <div class="flex gap-2">
                        <UInput v-model.number="state.amountPaid" type="number" min="0" :max="totalAmount"
                            step="0.01" class="w-full" />
                        <UButton variant="soft" color="neutral" label="Full" @click="markFullyPaid" />
                    </div>

                    <template #help>
                        <p class="text-xs text-muted">
                            Leave at 0 to record the sale unpaid. Balance:
                            <span class="font-medium">{{ format(balance) }}</span>
                        </p>
                    </template>
                </UFormField>

                <!-- Payment Method -->
                <UFormField v-if="Number(state.amountPaid) > 0" label="Payment Method" name="paymentMethod" required>
                    <USelectMenu v-model="state.paymentMethod" :items="methodOptions" value-key="value"
                        placeholder="Select payment method" class="w-full" />
                </UFormField>

                <!-- Collect now toggle - only offered once there's stock to hand over AND the
                     balance is fully settled; a partial payment never leaves with the item no
                     matter how eager the buyer is to "collect now" (see the alert below). -->
                <UFormField v-if="!isPreSale && isFullyPaid" label="Collection">
                    <div class="grid grid-cols-2 gap-2">
                        <UButton
                            :color="state.collectNow ? 'primary' : 'neutral'"
                            :variant="state.collectNow ? 'solid' : 'soft'"
                            icon="i-lucide-package-check"
                            label="Collecting Now"
                            block
                            @click="state.collectNow = true"
                        />
                        <UButton
                            :color="!state.collectNow ? 'primary' : 'neutral'"
                            :variant="!state.collectNow ? 'solid' : 'soft'"
                            icon="i-lucide-clock"
                            label="Collect Later"
                            block
                            @click="state.collectNow = false"
                        />
                    </div>
                    <template #help>
                        <p class="text-xs text-muted">
                            {{ state.collectNow
                                ? 'Stock is deducted now - the item leaves with the buyer today.'
                                : 'Stock stays put until this is collected later, from Supplies or Pending Pickups.' }}
                        </p>
                    </template>
                </UFormField>

                <!-- Awaiting-full-payment notice - in stock, but the balance isn't settled yet -->
                <UAlert
                    v-else-if="!isPreSale && !isFullyPaid"
                    color="info"
                    variant="soft"
                    icon="i-lucide-clock"
                    title="Full payment required to collect"
                    :description="`${selectedMaterial?.name ?? 'This item'} can't be handed over until the balance (${format(balance)}) is fully paid - it'll be marked to settle later until then.`"
                />

                <!-- Deferred-collection notice - fully paid and in stock, but the buyer said
                     they'll collect later -->
                <UAlert
                    v-else-if="isFullyPaid && !state.collectNow"
                    color="info"
                    variant="soft"
                    icon="i-lucide-clock"
                    title="Marked to collect later"
                    :description="`${selectedMaterial?.name ?? 'This item'} is in stock and paid for, but nothing is deducted until it's actually collected.`"
                />

                <!-- Note -->
                <UFormField label="Note" name="note">
                    <UTextarea v-model="state.note" placeholder="Optional note" :rows="2" class="w-full" />
                </UFormField>
            </UForm>
        </template>

        <!-- Footer -->
        <template #footer>
            <div class="flex gap-3">
                <UButton label="Record Sale" :icon="SALE_ICON" :loading="isLoading" @click="formRef?.submit()" />
                <UButton label="Cancel" variant="outline" color="neutral" :disabled="isLoading" @click="close" />
            </div>
        </template>
    </USlideover>
</template>
