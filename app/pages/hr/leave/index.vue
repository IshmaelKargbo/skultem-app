<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 class="text-2xl font-bold">
                    Leave Management
                </h1>

                <p class="text-sm text-muted">
                    Track and manage employee leave requests and balances.
                </p>
            </div>

            <div class="flex gap-2">
                <UButton icon="i-lucide-calendar" variant="soft">
                    Calendar
                </UButton>

                <UButton icon="i-lucide-plus" to="/hr/leave/add">
                    New Request
                </UButton>
            </div>
        </div>

        <!-- Summary Cards -->
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            <UCard>
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-muted">
                            Total Requests
                        </p>

                        <h2 class="mt-1 text-3xl font-bold">
                            48
                        </h2>

                        <p class="text-xs text-green-500">
                            This academic year
                        </p>
                    </div>

                    <UIcon name="i-lucide-file-text" class="text-primary text-3xl" />
                </div>
            </UCard>

            <UCard>
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-muted">
                            Pending
                        </p>

                        <h2 class="mt-1 text-3xl font-bold">
                            7
                        </h2>

                        <p class="text-xs text-amber-500">
                            Awaiting approval
                        </p>
                    </div>

                    <UIcon name="i-lucide-clock-3" class="text-amber-500 text-3xl" />
                </div>
            </UCard>

            <UCard>
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-muted">
                            Approved
                        </p>

                        <h2 class="mt-1 text-3xl font-bold">
                            36
                        </h2>

                        <p class="text-xs text-green-500">
                            75%
                        </p>
                    </div>

                    <UIcon name="i-lucide-check-circle" class="text-green-500 text-3xl" />
                </div>
            </UCard>

            <UCard>
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-muted">
                            Rejected
                        </p>

                        <h2 class="mt-1 text-3xl font-bold">
                            5
                        </h2>

                        <p class="text-xs text-red-500">
                            10%
                        </p>
                    </div>

                    <UIcon name="i-lucide-x-circle" class="text-red-500 text-3xl" />
                </div>
            </UCard>

        </div>

        <!-- Filters -->
        <UCard>
            <div class="grid gap-3 md:grid-cols-4">

                <UInput icon="i-lucide-search" placeholder="Search employee..." />

                <USelect placeholder="Status" :items="statuses" />

                <USelect placeholder="Leave Type" :items="leaveTypes" />

                <UButton block icon="i-lucide-filter" variant="soft">
                    Apply Filters
                </UButton>

            </div>
        </UCard>

        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            <UCard v-for="request in requests" :key="request.employee" class="rounded-3xl bg-white hover:ring-primary-300">
                <div class="space-y-4">

                    <!-- Employee -->
                    <div class="flex flex-col justify-center items-center gap-3">
                        <UAvatar size="3xl" :alt="request.employee" />

                        <div>
                            <h3 class="font-semibold">
                                {{ request.employee }}
                            </h3>

                            <p class="text-xs text-muted text-center">
                                {{ request.department }}
                            </p>
                        </div>
                    </div>

                    <!-- Leave Info -->
                    <div class="space-y-2 text-sm">

                        <div class="flex items-center justify-between">
                            <span class="text-muted">Leave Type</span>
                            <span class="font-medium">
                                {{ request.type }}
                            </span>
                        </div>

                        <div class="flex items-center justify-between">
                            <span class="text-muted">Duration</span>
                            <span class="font-medium">
                                {{ request.duration }}
                            </span>
                        </div>

                        <div class="flex items-center justify-between">
                            <span class="text-muted">Dates</span>
                            <span class="font-medium">
                                {{ request.dates }}
                            </span>
                        </div>

                    </div>

                    <!-- Status -->
                    <div class="flex items-center justify-between space-x-3">

                        <UBadge :color="statusColor(request.status)" size="lg" variant="soft" class="w-full justify-center items-center" >
                            {{ request.status }}
                        </UBadge>

                        <UButton size="sm" class="w-full justify-center items-center cursor-pointer"  icon="i-lucide-eye"
                            @click="$router.push(`/hr/leave/${request.id}`)">
                            View
                        </UButton>
                    </div>

                </div>
            </UCard>

        </div>

    </div>
</template>

<script setup lang="ts">
const statuses = [
    "Pending",
    "Approved",
    "Rejected"
]

const leaveTypes = [
    "Annual Leave",
    "Sick Leave",
    "Emergency Leave",
    "Maternity Leave"
]



const requests = [
    {
        employee: "John Doe",
        department: "Teaching",
        type: "Annual Leave",
        duration: "5 Days",
        dates: "10 Jun - 14 Jun",
        status: "Approved"
    },
    {
        employee: "Mary Kamara",
        department: "Finance",
        type: "Sick Leave",
        duration: "3 Days",
        dates: "15 Jun - 17 Jun",
        status: "Pending"
    },
    {
        employee: "Peter Sesay",
        department: "ICT",
        type: "Emergency Leave",
        duration: "1 Day",
        dates: "18 Jun",
        status: "Rejected"
    }
]

function statusColor(status: string) {
    switch (status) {
        case "Approved":
            return "success"

        case "Pending":
            return "warning"

        case "Rejected":
            return "error"

        default:
            return "neutral"
    }
}
</script>