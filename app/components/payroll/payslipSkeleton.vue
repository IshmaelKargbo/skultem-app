<template>
  <!-- Placeholder shaped like PayrollPayslipDocument: letterhead, employee details, earnings/deductions, net pay -->
  <div class="mx-auto w-full max-w-3xl space-y-8 rounded-2xl border border-default bg-default p-6 shadow-sm sm:p-10">
    <div class="flex items-start justify-between gap-6">
      <div class="flex items-center gap-4">
        <USkeleton class="size-14 rounded-xl" />
        <div class="space-y-2">
          <USkeleton class="h-5 w-44" />
          <USkeleton class="h-3.5 w-32" />
        </div>
      </div>
      <div class="flex flex-col items-end space-y-2">
        <USkeleton class="h-6 w-24" />
        <USkeleton class="h-3.5 w-28" />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div v-for="i in 4" :key="i" class="space-y-2">
        <USkeleton class="h-3 w-16" />
        <USkeleton class="h-4 w-24" />
      </div>
    </div>

    <div class="grid gap-6 sm:grid-cols-2">
      <div v-for="col in 2" :key="col" class="space-y-3">
        <USkeleton class="h-4 w-24" />
        <div v-for="row in 4" :key="row" class="flex justify-between">
          <USkeleton class="h-3.5 w-28" />
          <USkeleton class="h-3.5 w-16" />
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-default pt-6">
      <USkeleton class="h-5 w-20" />
      <USkeleton class="h-7 w-32" />
    </div>
  </div>
</template>
