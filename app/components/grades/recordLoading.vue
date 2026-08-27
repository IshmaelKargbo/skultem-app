<template>
    <div class="rounded-xl border border-default p-4">
        <div class="flex gap-3">
            <USkeleton class="h-10 w-10 rounded-xl" />

            <div class="flex-1 space-y-2">
                <USkeleton class="h-4 w-40" />
                <USkeleton class="h-3 w-52" />

                <div class="flex gap-4">
                    <USkeleton class="h-3 w-24" />
                    <USkeleton class="h-3 w-16" />
                    <USkeleton class="h-3 w-16" />
                </div>

                <USkeleton class="h-2 w-full rounded" />
            </div>
        </div>
    </div>
</template>