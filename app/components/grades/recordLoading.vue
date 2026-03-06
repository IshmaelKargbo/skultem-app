<template>
    <div class="p-4 border-b border-gray-200">
        <div class="flex gap-3">
            <USkeleton class="h-10 w-10 rounded-full" />

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