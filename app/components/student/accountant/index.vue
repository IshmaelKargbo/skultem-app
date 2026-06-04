<template>
    <div class="p-4 sm:p-6 lg:p-7 h-full space-y-4 sm:space-y-5 overflow-y-auto">
        <section class="rounded-3xl border border-gray-200 bg-white/90 p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900/80 sm:p-5 lg:p-6">
            <div class="space-y-1.5">
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                    Student finance
                </p>
                <h1 class="text-2xl font-display font-semibold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                    Student Finance Overview
                </h1>
                <p class="max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                    Track student fee status, balances, and collections from one responsive view.
                </p>
            </div>
        </section>
        <StudentAccountantReport />
        <StudentAccountantTable />
    </div>
</template>

<script setup lang="ts">
const { can } = useAuth()
</script>
