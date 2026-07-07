<template>
  <div class="space-y-6 mt-6 p-4">

    <!-- Header -->
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold tracking-tight">
            {{ template.name }}
          </h1>
          <UBadge color="success" variant="subtle">
            Default
          </UBadge>
        </div>
        <p class="mt-1 text-sm text-muted">
          Preview how ID cards generated with this template will appear.
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <UButton icon="i-lucide-arrow-left" variant="outline" color="neutral" to="/id-cards/templates">
          Back
        </UButton>
        <UButton icon="i-lucide-settings-2" :variant="settingsOpen ? 'solid' : 'outline'" color="neutral"
          @click="settingsOpen = !settingsOpen">
          Settings
        </UButton>
        <UButton icon="i-lucide-download" variant="outline" color="neutral" :loading="downloading" @click="downloadPdf">
          Download PDF
        </UButton>
        <UButton icon="i-lucide-printer" variant="outline" color="neutral" @click="printCard">
          Print
        </UButton>
      </div>

    </div>

    <!-- Quick stats -->
    <div class="grid gap-4 sm:grid-cols-3">

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <UIcon name="i-lucide-users" class="size-6 text-primary" />
          </div>
          <div>
            <p class="text-2xl font-bold leading-tight">{{ template.cardsIssued }}</p>
            <p class="text-sm text-muted">Cards issued</p>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
            <UIcon name="i-lucide-school" class="size-6 text-blue-500" />
          </div>
          <div>
            <p class="text-2xl font-bold leading-tight">{{ template.level }}</p>
            <p class="text-sm text-muted">Applies to</p>
          </div>
        </div>
      </UCard>

      <UCard :ui="{ body: 'p-5' }">
        <div class="flex items-center gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
            <UIcon name="i-lucide-calendar-clock" class="size-6 text-orange-500" />
          </div>
          <div>
            <p class="text-2xl font-bold leading-tight">{{ template.validityYears }}yr</p>
            <p class="text-sm text-muted">Validity period</p>
          </div>
        </div>
      </UCard>

    </div>

    <div class="grid gap-6 lg:grid-cols-3">

      <!-- Template Info -->
      <div class="space-y-6 lg:sticky lg:top-6 lg:self-start">

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-info" class="size-5 text-primary" />
              <h3 class="font-semibold">Template Details</h3>
            </div>
          </template>
          <dl class="divide-y divide-default">
            <div class="flex items-center justify-between py-2.5">
              <dt class="text-sm text-muted">Type</dt>
              <dd class="text-sm font-medium">{{ template.type }}</dd>
            </div>
            <div class="flex items-center justify-between py-2.5">
              <dt class="text-sm text-muted">School Level</dt>
              <dd class="text-sm font-medium">{{ template.level }}</dd>
            </div>
            <div class="flex items-center justify-between py-2.5">
              <dt class="text-sm text-muted">Created By</dt>
              <dd class="text-sm font-medium">{{ template.createdBy }}</dd>
            </div>
            <div class="flex items-center justify-between py-2.5">
              <dt class="text-sm text-muted">Updated</dt>
              <dd class="text-sm font-medium">{{ template.updatedAt }}</dd>
            </div>
          </dl>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-palette" class="size-5 text-primary" />
              <h3 class="font-semibold">Theme</h3>
            </div>
          </template>
          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <div class="size-9 shrink-0 rounded-lg border border-default"
                :style="{ backgroundColor: template.accentColor }" />
              <div>
                <p class="text-sm font-medium">Accent Color</p>
                <p class="font-mono text-xs text-muted">{{ template.accentColor }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 pt-1">
              <div class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-default">
                <UIcon name="i-lucide-shield-check" class="size-4 text-muted" />
              </div>
              <div>
                <p class="text-sm font-medium">Security Features</p>
                <p class="text-xs text-muted">Watermark, barcode, hologram strip</p>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Preview + Settings -->
      <div class="lg:col-span-2 space-y-4">

        <!-- ─── SETTINGS PANEL ─── -->
        <Transition enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2">
          <UCard v-if="settingsOpen">

            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-settings-2" class="size-5 text-primary" />
                  <h3 class="font-semibold">ID Card Settings</h3>
                </div>
                <p class="text-xs text-muted">Configure layout, colours and fields.</p>
              </div>
            </template>

            <div class="space-y-7">

              <!-- ── Target Audience ── -->
              <section>
                <p class="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted">Target Audience</p>
                <div class="flex gap-2">
                  <UButton v-for="a in audienceOptions" :key="a.value"
                    :variant="settings.audience === a.value ? 'solid' : 'outline'"
                    :color="settings.audience === a.value ? 'primary' : 'neutral'" :icon="a.icon" size="sm"
                    @click="settings.audience = a.value">
                    {{ a.label }}
                  </UButton>
                </div>
              </section>

              <div class="border-t border-default" />

              <!-- ── Layout & Style ── -->
              <section>
                <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Layout & Style</p>
                <div class="grid gap-5 sm:grid-cols-2">

                  <!-- Layout type -->
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium">Layout type</label>
                    <div class="flex gap-2">
                      <button v-for="layout in layoutOptions" :key="layout.value" :class="[
                        'flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-medium transition-all',
                        settings.layout === layout.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-default bg-muted/30 text-muted hover:border-primary/40'
                      ]" @click="settings.layout = layout.value">
                        <!-- Mini card illustration -->
                        <div :class="[
                          'rounded bg-current/20 border border-current/30',
                          layout.value === 'vertical' ? 'h-10 w-7' : 'h-7 w-10'
                        ]" />
                        {{ layout.label }}
                      </button>
                    </div>
                  </div>

                  <!-- Profile image style -->
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium">Profile image style</label>
                    <div class="flex gap-2">
                      <button v-for="shape in profileShapeOptions" :key="shape.value" :class="[
                        'flex flex-1 flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-medium transition-all',
                        settings.profileShape === shape.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-default bg-muted/30 text-muted hover:border-primary/40'
                      ]" @click="settings.profileShape = shape.value">
                        <div :class="[
                          'size-8 bg-current/20 border border-current/30',
                          shape.value === 'round' ? 'rounded-full' : 'rounded-md'
                        ]" />
                        {{ shape.label }}
                      </button>
                    </div>
                  </div>

                </div>
              </section>

              <div class="border-t border-default" />

              <!-- ── Colour ── -->
              <section>
                <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Colour</p>
                <div class="grid gap-4 sm:grid-cols-3">

                  <div class="space-y-1.5">
                    <label class="text-sm font-medium">Header colour</label>
                    <div class="flex items-center gap-2">
                      <div class="relative size-9 shrink-0 overflow-hidden rounded-lg border border-default shadow-sm">
                        <input type="color" v-model="settings.headerColor"
                          class="absolute -inset-1 size-12 cursor-pointer border-0 bg-transparent p-0 opacity-0" />
                        <div class="size-full rounded-lg" :style="{ backgroundColor: settings.headerColor }" />
                        <UIcon name="i-lucide-pipette"
                          class="absolute bottom-0.5 right-0.5 size-3 text-white/80 drop-shadow" />
                      </div>
                      <input v-model="settings.headerColor" maxlength="7"
                        class="h-9 w-full rounded-lg border border-default bg-transparent px-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-sm font-medium">Footer colour</label>
                    <div class="flex items-center gap-2">
                      <div class="relative size-9 shrink-0 overflow-hidden rounded-lg border border-default shadow-sm">
                        <input type="color" v-model="settings.footerColor"
                          class="absolute -inset-1 size-12 cursor-pointer border-0 bg-transparent p-0 opacity-0" />
                        <div class="size-full rounded-lg" :style="{ backgroundColor: settings.footerColor }" />
                        <UIcon name="i-lucide-pipette"
                          class="absolute bottom-0.5 right-0.5 size-3 text-white/80 drop-shadow" />
                      </div>
                      <input v-model="settings.footerColor" maxlength="7"
                        class="h-9 w-full rounded-lg border border-default bg-transparent px-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-sm font-medium">Header / footer text</label>
                    <div class="flex items-center gap-2">
                      <div class="relative size-9 shrink-0 overflow-hidden rounded-lg border border-default shadow-sm">
                        <input type="color" v-model="settings.headerTextColor"
                          class="absolute -inset-1 size-12 cursor-pointer border-0 bg-transparent p-0 opacity-0" />
                        <div class="size-full rounded-lg" :style="{ backgroundColor: settings.headerTextColor }" />
                        <UIcon name="i-lucide-pipette" class="absolute bottom-0.5 right-0.5 size-3 drop-shadow"
                          :style="{ color: settings.headerTextColor === '#ffffff' ? '#555' : '#fff' }" />
                      </div>
                      <input v-model="settings.headerTextColor" maxlength="7"
                        class="h-9 w-full rounded-lg border border-default bg-transparent px-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>

                  <div class="space-y-1.5 sm:col-span-3">
                    <label class="text-sm font-medium">Primary text colour</label>
                    <div class="flex items-center gap-2 sm:w-1/3">
                      <div class="relative size-9 shrink-0 overflow-hidden rounded-lg border border-default shadow-sm">
                        <input type="color" v-model="settings.primaryTextColor"
                          class="absolute -inset-1 size-12 cursor-pointer border-0 bg-transparent p-0 opacity-0" />
                        <div class="size-full rounded-lg" :style="{ backgroundColor: settings.primaryTextColor }" />
                        <UIcon name="i-lucide-pipette"
                          class="absolute bottom-0.5 right-0.5 size-3 text-white/80 drop-shadow" />
                      </div>
                      <input v-model="settings.primaryTextColor" maxlength="7"
                        class="h-9 w-full rounded-lg border border-default bg-transparent px-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>

                </div>
              </section>

              <div class="border-t border-default" />

              <!-- ── Dimensions ── -->
              <section>
                <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Dimensions (MM)</p>
                <div class="flex items-center gap-4 sm:w-2/3">
                  <div class="flex-1 space-y-1.5">
                    <label class="text-sm font-medium">Width</label>
                    <UInput v-model.number="settings.widthMm" type="number" min="50" max="200" placeholder="85">
                      <template #trailing>
                        <span class="text-xs text-muted">mm</span>
                      </template>
                    </UInput>
                  </div>
                  <div class="mt-6 text-muted">×</div>
                  <div class="flex-1 space-y-1.5">
                    <label class="text-sm font-medium">Height</label>
                    <UInput v-model.number="settings.heightMm" type="number" min="50" max="200" placeholder="54">
                      <template #trailing>
                        <span class="text-xs text-muted">mm</span>
                      </template>
                    </UInput>
                  </div>
                </div>
              </section>

              <div class="border-t border-default" />

              <!-- ── Background ── -->
              <section>
                <p class="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Background</p>
                <div class="space-y-4">

                  <!-- Background image upload -->
                  <div class="space-y-1.5">
                    <label class="text-sm font-medium">Background image</label>
                    <div
                      class="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-default bg-muted/20 px-6 py-5 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
                      @click="bgImageInput?.click()" @dragover.prevent @drop.prevent="onBgDrop">
                      <input ref="bgImageInput" type="file" accept="image/*" class="hidden" @change="onBgImageChange" />

                      <!-- Preview -->
                      <template v-if="settings.bgImageUrl">
                        <div class="relative">
                          <img :src="settings.bgImageUrl" alt="Background preview"
                            class="h-20 w-32 rounded-lg object-cover shadow" />
                          <button
                            class="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                            @click.stop="clearBgImage">
                            <UIcon name="i-lucide-x" class="size-3" />
                          </button>
                        </div>
                        <p class="text-xs text-muted">Click to replace</p>
                      </template>

                      <template v-else>
                        <div class="flex size-10 items-center justify-center rounded-xl bg-muted">
                          <UIcon name="i-lucide-image-plus" class="size-5 text-muted" />
                        </div>
                        <div>
                          <p class="text-sm font-medium">Upload background image</p>
                          <p class="mt-0.5 text-xs text-muted">PNG, JPG or SVG · Drag & drop or click</p>
                        </div>
                      </template>
                    </div>
                  </div>

                  <!-- Opacity slider -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label class="text-sm font-medium">Opacity</label>
                      <span class="text-sm font-semibold text-primary">{{ settings.bgOpacity }}%</span>
                    </div>
                    <div class="relative h-5 flex items-center">
                      <!-- Track -->
                      <div class="absolute inset-x-0 h-1.5 rounded-full overflow-hidden">
                        <div class="h-full bg-muted" />
                        <div class="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
                          :style="{ width: settings.bgOpacity + '%' }" />
                      </div>
                      <input type="range" v-model.number="settings.bgOpacity" min="0" max="100" step="5"
                        class="relative w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer" />
                    </div>
                    <div class="flex justify-between text-[10px] text-muted">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>

                </div>
              </section>

              <div class="border-t border-default" />

              <!-- ── Select Fields ── -->
              <section>
                <div class="mb-3 flex items-center justify-between">
                  <p class="text-xs font-semibold uppercase tracking-widest text-muted">
                    Select fields
                    <span class="ml-1 font-normal normal-case">({{ settings.audience === 'student' ? 'Student' : 'Staff'
                    }})</span>
                  </p>
                  <p class="text-[11px] text-muted">Click to toggle visibility</p>
                </div>

                <div class="grid gap-2 sm:grid-cols-2">
                  <button v-for="field in activeFields" :key="field.key" :class="[
                    'group flex items-center gap-3 rounded-xl border-2 px-3.5 py-2.5 text-left text-sm transition-all',
                    field.enabled
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-default bg-muted/20 text-muted hover:border-primary/30'
                  ]" @click="field.enabled = !field.enabled">
                    <div :class="[
                      'flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors',
                      field.enabled ? 'border-primary bg-primary text-white' : 'border-default bg-white'
                    ]">
                      <UIcon v-if="field.enabled" name="i-lucide-check" class="size-3.5" />
                    </div>
                    <UIcon :name="field.icon" class="size-4 shrink-0" />
                    <span class="font-medium">{{ field.label }}</span>
                    <UBadge v-if="field.required" color="warning" variant="subtle" size="xs" class="ml-auto">
                      Required
                    </UBadge>
                  </button>
                </div>
              </section>

            </div>

            <template #footer>
              <div class="flex items-center justify-between">
                <UButton variant="ghost" color="neutral" size="sm" @click="resetSettings">
                  Reset to defaults
                </UButton>
                <div class="flex gap-2">
                  <UButton variant="outline" color="neutral" size="sm" @click="settingsOpen = false">
                    Cancel
                  </UButton>
                  <UButton color="primary" size="sm" icon="i-lucide-save" @click="saveSettings">
                    Save settings
                  </UButton>
                </div>
              </div>
            </template>

          </UCard>
        </Transition>

        <!-- ─── CARD PREVIEW ─── -->
        <UCard :ui="{ body: 'p-6 sm:p-10' }"
          class="bg-[radial-gradient(circle_at_top,_var(--ui-bg-muted)_0%,_transparent_70%)]">

          <!-- Front / Back toggle -->
          <div class="mb-6 flex justify-center">
            <UButtonGroup>
              <UButton :variant="side === 'front' ? 'solid' : 'outline'" color="neutral" size="sm"
                @click="side = 'front'">
                Front
              </UButton>
              <UButton :variant="side === 'back' ? 'solid' : 'outline'" color="neutral" size="sm"
                @click="side = 'back'">
                Back
              </UButton>
            </UButtonGroup>
          </div>

          <div class="flex justify-center">

            <!-- ID CARD: FRONT -->
            <div v-if="side === 'front'" :class="[
              'relative w-full overflow-hidden bg-white shadow-[0_20px_50px_-12px_rgb(0_0_0_/_0.25)] ring-1 ring-black/5',
              settings.layout === 'vertical'
                ? 'max-w-[420px] rounded-[28px]'
                : 'max-w-[600px] rounded-[20px]'
            ]">

              <!-- Background image layer -->
              <div v-if="settings.bgImageUrl" class="pointer-events-none absolute inset-0 z-0" :style="{
                backgroundImage: `url(${settings.bgImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: settings.bgOpacity / 100
              }" />

              <div :class="['relative z-10', settings.layout === 'horizontal' && 'flex']">

                <!-- Top header -->
                <div :class="[
                  'px-6 pb-4 pt-1 text-center text-xs font-semibold uppercase tracking-[0.25em]',
                  settings.layout === 'horizontal' && 'flex flex-col justify-center w-48 shrink-0 pb-6'
                ]" :style="{ backgroundColor: settings.headerColor }">
                  <div :class="[
                    'flex items-center justify-center space-y-4',
                    settings.layout === 'vertical' ? 'flex-col h-40' : 'flex-col h-full py-6 gap-4'
                  ]">
                    <div
                      class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/95 p-2 shadow-sm">
                      <img :src="template.school.logo" class="size-full object-contain" alt="School logo">
                    </div>
                    <div class="min-w-0">
                      <p class="text-center text-base font-semibold uppercase tracking-wide"
                        :style="{ color: settings.headerTextColor }">
                        {{ template.school.name }}
                      </p>
                      <p class="mt-0.5 text-xs font-medium uppercase text-center tracking-widest"
                        :style="{ color: settings.headerTextColor, opacity: 0.75 }">
                        Student ID Card
                      </p>
                    </div>
                  </div>
                </div>

                <!-- ================= RIGHT BODY ================= -->
                <div :class="[
                  'relative flex-1',
                  settings.layout === 'horizontal' && 'flex flex-col'
                ]">

                  <!-- Decorative Background -->
                  <div class="absolute inset-0 overflow-hidden pointer-events-none">
                    <div class="absolute -right-12 top-0 h-40 w-40 rounded-full opacity-5"
                      :style="{ backgroundColor: settings.headerColor }" />
                    <div class="absolute left-0 bottom-0 h-32 w-32 rounded-full opacity-5"
                      :style="{ backgroundColor: settings.headerColor }" />

                    <!-- Watermark -->
                    <div class="absolute inset-0 flex items-center justify-center opacity-[0.04]">
                      <img :src="template.school.logo" class="w-52 h-52 object-contain">
                    </div>
                  </div>

                  <!-- ================= PHOTO ================= -->

                  <div :class="[
                    'relative z-10 flex',
                    settings.layout === 'vertical'
                      ? '-mt-12 justify-center'
                      : 'mt-6 px-6'
                  ]">

                    <div class="relative">
                      <!-- Photo Frame -->
                      <div :class="[
                        'overflow-hidden border-4 border-white bg-gray-100 shadow-xl mt-4',
                        settings.profileShape === 'round'
                          ? 'h-28 w-28 rounded-full'
                          : 'h-28 w-28 rounded-3xl'
                      ]">

                        <!-- Replace this with student image -->
                        <div class="flex h-full items-center justify-center">
                          <UIcon name="i-lucide-user" class="text-5xl text-gray-400" />
                        </div>

                      </div>

                    </div>

                  </div>

                  <!-- ================= STUDENT INFO ================= -->

                  <div :class="[
                    'relative z-10 px-6',
                    settings.layout === 'vertical'
                      ? 'pt-5 text-center'
                      : 'pt-4 text-left'
                  ]">

                    <h2 class="text-2xl font-black tracking-wide uppercase"
                      :style="{ color: settings.primaryTextColor }">
                      {{ template.student.name }}
                    </h2>

                    <p class="mt-1 text-sm font-medium text-gray-500">
                      {{ template.student.class }}
                    </p>
                  </div>

                  <!-- ================= INFORMATION ================= -->

                  <div class="relative z-10 mt-6 px-6 pb-6">

                    <div class="grid grid-cols-2 gap-3">

                      <template v-for="field in activeFields" :key="field.key">

                        <div v-if="field.enabled && field.cardSlot === 'front'"
                          class="group rounded-2xl border border-gray-200 bg-white/90 p-3 shadow-sm transition-all duration-200 hover:shadow-md">

                          <div class="flex items-center gap-2">

                            <div class="flex h-9 w-9 items-center justify-center rounded-xl" :style="{
                              backgroundColor: settings.headerColor + '15'
                            }">
                              <UIcon :name="field.icon" :style="{ color: settings.headerColor }" />
                            </div>

                            <div class="min-w-0">

                              <p class="text-[10px] uppercase tracking-widest text-gray-400">
                                {{ field.label }}
                              </p>

                              <p class="truncate text-sm font-bold" :style="{ color: settings.primaryTextColor }">
                                {{
                                  template.student[
                                  field.key as keyof typeof template.student
                                  ] ?? "—"
                                }}
                              </p>

                            </div>

                          </div>

                        </div>

                      </template>

                    </div>

                  </div>

                </div>

              </div>

              <!-- Signature strip -->
              <div class="relative border-t border-dashed border-gray-200 px-6 py-3">
                <div class="flex items-center justify-between text-[10px] text-gray-400">
                  <span>Authorized Signature</span>
                  <span class="italic">{{ template.school.principal }}</span>
                </div>
              </div>

              <!-- Footer -->
              <div class="relative border-t border-gray-100 px-6 py-3 text-center text-[11px]"
                :style="{ backgroundColor: settings.footerColor, color: settings.headerTextColor }">
                If found, kindly return to {{ template.school.name }}
              </div>

            </div>

            <!-- ================= BACK OF ID ================= -->
            <div v-else
              class="relative w-full max-w-[420px] overflow-hidden rounded-[32px] bg-white shadow-[0_25px_80px_-20px_rgba(0,0,0,.28)] ring-1 ring-black/5">

              <!-- Decorative Background -->
              <div class="absolute inset-0 overflow-hidden">
                <div class="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-10"
                  :style="{ backgroundColor: settings.headerColor }" />

                <div class="absolute -left-20 bottom-0 h-48 w-48 rounded-full opacity-5"
                  :style="{ backgroundColor: settings.headerColor }" />

                <!-- Watermark -->
                <div class="absolute inset-0 flex items-center justify-center opacity-[0.04]">
                  <img :src="template.school.logo" class="h-52 w-52 object-contain" alt="">
                </div>
              </div>

              <div class="relative z-10">

                <!-- Header -->
                <div class="px-6 py-5 text-center" :style="{ backgroundColor: settings.headerColor }">

                  <div class="flex justify-center mb-2">
                    <div class="rounded-xl bg-white p-2 shadow">
                      <img :src="template.school.logo" class="h-10 w-10 object-contain">
                    </div>
                  </div>

                  <h3 class="text-sm font-bold uppercase tracking-[0.35em]"
                    :style="{ color: settings.headerTextColor }">
                    Student Information
                  </h3>

                  <p class="mt-1 text-xs opacity-80" :style="{ color: settings.headerTextColor }">
                    Scan QR Code to Verify Identity
                  </p>

                </div>


                <!-- Contacts -->
                <div class="mt-6 grid grid-cols-2 gap-4 px-6">

                  <div class="rounded-2xl border bg-gray-50 p-4">

                    <div class="flex items-center gap-2">

                      <div class="flex h-9 w-9 items-center justify-center rounded-xl"
                        :style="{ backgroundColor: settings.headerColor + '15' }">

                        <UIcon name="i-lucide-users" :style="{ color: settings.headerColor }" />

                      </div>

                      <div>

                        <p class="text-[10px] uppercase tracking-widest text-gray-500">
                          Parent
                        </p>

                        <p class="text-xs font-semibold">
                          {{ template.student.parentContact }}
                        </p>

                      </div>

                    </div>

                  </div>

                  <div class="rounded-2xl border bg-gray-50 p-4">

                    <div class="flex items-center gap-2">

                      <div class="flex h-9 w-9 items-center justify-center rounded-xl"
                        :style="{ backgroundColor: settings.headerColor + '15' }">

                        <UIcon name="i-lucide-phone-call" :style="{ color: settings.headerColor }" />

                      </div>

                      <div>

                        <p class="text-[10px] uppercase tracking-widest text-gray-500">
                          Emergency
                        </p>

                        <p class="text-xs font-semibold">
                          {{ template.student.emergencyContact }}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                <!-- Address -->
                <div class="mt-5 px-6">

                  <div class="rounded-2xl border bg-gray-50 p-4">

                    <div class="flex gap-3">

                      <div class="flex h-10 w-10 items-center justify-center rounded-xl"
                        :style="{ backgroundColor: settings.headerColor + '15' }">

                        <UIcon name="i-lucide-map-pin" :style="{ color: settings.headerColor }" />

                      </div>

                      <div>

                        <p class="text-[10px] uppercase tracking-widest text-gray-500">
                          School Address
                        </p>

                        <p class="mt-1 text-sm font-medium leading-6">
                          {{ template.school.address }}
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

                <!-- Rules -->
                <div class="mt-5 px-6">

                  <div class="rounded-2xl border border-dashed bg-amber-50 p-4">

                    <div class="flex items-center gap-2">

                      <UIcon name="i-lucide-shield-check" class="text-green-600" />

                      <h4 class="font-semibold">
                        Important Notice
                      </h4>

                    </div>

                    <ul class="mt-3 space-y-2 text-xs leading-5 text-gray-600">

                      <li>• This card remains the property of {{ template.school.name }}.</li>

                      <li>• Carry this ID while on campus.</li>

                      <li>• Report lost cards immediately.</li>

                      <li>• Do not alter or duplicate this card.</li>

                    </ul>

                  </div>

                </div>

                <!-- QR -->
                <div class="px-6 pt-6">
                  <div class="flex justify-center">

                    <div class="rounded-3xl border bg-gray-50 p-5 shadow-inner">

                      <UIcon name="i-lucide-qr-code" class="text-[90px] text-gray-700" />

                    </div>

                  </div>
                </div>

                <!-- Footer -->
                <div class="mt-6 px-6 py-5 text-center" :style="{
                  backgroundColor: settings.footerColor,
                  color: settings.headerTextColor
                }">

                  <p class="font-semibold tracking-wide">
                    {{ template.school.name }}
                  </p>
                </div>

              </div>g

            </div>
          </div>

        </UCard>

      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const appStore = useAppStore()
const { success } = useNotify()

const templateId = computed(() => route.params.id)

const downloading = ref(false)
const side = ref<'front' | 'back'>('front')
const settingsOpen = ref(false)
const bgImageInput = ref<HTMLInputElement | null>(null)

// ─── Template data ───────────────────────────────────────────────────────────
const template = ref({
  id: templateId.value,
  name: 'Modern Blue Template',
  type: 'Student ID Card',
  level: 'Secondary School',
  createdBy: 'Administrator',
  updatedAt: 'Jun 17, 2026',
  cardsIssued: 482,
  validityYears: 1,
  accentColor: '#2563eb',
  accentColorDark: '#1e3a8a',
  school: {
    name: "KING'S WAY INTERNATIONAL SCHOOL",
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg',
    principal: 'Dr. A. Conteh',
    address: '12 Wilkinson Road, Freetown, Sierra Leone'
  },
  student: {
    name: 'John Kamara',
    admissionNo: 'KWIS001',
    class: 'JSS1-A',
    gender: 'Male',
    dob: '12 Mar 2011',
    expiryDate: 'Jun 30, 2027',
    emergencyContact: '+232 76 123 456',
    parentContact: '+232 76 123 456',
  }
})



// ─── Settings state ──────────────────────────────────────────────────────────
const defaultSettings = {
  audience: 'student' as 'student' | 'staff',
  layout: 'vertical' as 'vertical' | 'horizontal',
  profileShape: 'square' as 'round' | 'square',
  headerColor: '#2563eb',
  footerColor: '#2563eb',
  headerTextColor: '#ffffff',
  primaryTextColor: '#111827',
  widthMm: 85,
  heightMm: 54,
  bgImageUrl: '' as string,
  bgOpacity: 20,
}

const settings = reactive({ ...defaultSettings })

// ─── Options ─────────────────────────────────────────────────────────────────
const audienceOptions = [
  { value: 'student', label: 'Student', icon: 'i-lucide-graduation-cap' },
  { value: 'staff', label: 'Staff', icon: 'i-lucide-briefcase' },
]

const layoutOptions = [
  { value: 'vertical', label: 'Vertical' },
  { value: 'horizontal', label: 'Horizontal' },
]

const profileShapeOptions = [
  { value: 'round', label: 'Round' },
  { value: 'square', label: 'Square' },
]

// ─── Field definitions ────────────────────────────────────────────────────────
interface FieldDef {
  key: string
  label: string
  icon: string
  cardSlot: 'front' | 'back'
  enabled: boolean
  required?: boolean
}

const studentFields = reactive<FieldDef[]>([
  { key: 'name', label: 'Full Name', icon: 'i-lucide-user', cardSlot: 'front', enabled: true, required: true },
  { key: 'admissionNo', label: 'Admission No.', icon: 'i-lucide-id-card', cardSlot: 'front', enabled: true, required: true },
  { key: 'class', label: 'Class', icon: 'i-lucide-school', cardSlot: 'front', enabled: true },
  { key: 'gender', label: 'Gender', icon: 'i-lucide-user-round', cardSlot: 'front', enabled: true },
  { key: 'dob', label: 'Date of Birth', icon: 'i-lucide-calendar-days', cardSlot: 'front', enabled: true },
  { key: 'expiryDate', label: 'Valid Until', icon: 'i-lucide-calendar-check', cardSlot: 'front', enabled: true },
  { key: 'parentContact', label: 'Parent Contact', icon: 'i-lucide-phone', cardSlot: 'back', enabled: true },
  { key: 'emergencyContact', label: 'Emergency Contact', icon: 'i-lucide-phone-call', cardSlot: 'back', enabled: true },
])

const staffFields = reactive<FieldDef[]>([
  { key: 'name', label: 'Full Name', icon: 'i-lucide-user', cardSlot: 'front', enabled: true, required: true },
  { key: 'staffId', label: 'Staff ID', icon: 'i-lucide-id-card', cardSlot: 'front', enabled: true, required: true },
  { key: 'role', label: 'Role', icon: 'i-lucide-briefcase', cardSlot: 'front', enabled: true },
  { key: 'department', label: 'Department', icon: 'i-lucide-building-2', cardSlot: 'front', enabled: true },
  { key: 'gender', label: 'Gender', icon: 'i-lucide-user-round', cardSlot: 'front', enabled: false },
  { key: 'expiryDate', label: 'Valid Until', icon: 'i-lucide-calendar-check', cardSlot: 'front', enabled: true },
  { key: 'email', label: 'Email', icon: 'i-lucide-mail', cardSlot: 'back', enabled: true },
  { key: 'phone', label: 'Phone', icon: 'i-lucide-phone', cardSlot: 'back', enabled: true },
])

const activeFields = computed(() =>
  settings.audience === 'student' ? studentFields : staffFields
)

// ─── Background image ─────────────────────────────────────────────────────────
function onBgImageChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) loadBgFile(file)
}

function onBgDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) loadBgFile(file)
}

function loadBgFile(file: File) {
  const reader = new FileReader()
  reader.onload = (ev) => {
    settings.bgImageUrl = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

function clearBgImage() {
  settings.bgImageUrl = ''
  if (bgImageInput.value) bgImageInput.value.value = ''
}

// ─── Actions ──────────────────────────────────────────────────────────────────
function resetSettings() {
  Object.assign(settings, { ...defaultSettings })
  studentFields.forEach(f => {
    if (!f.required) f.enabled = true
  })
}

function saveSettings() {
  // TODO: persist via API
  success('Settings saved')
  settingsOpen.value = false
}

function printCard() {
  window.print()
}

async function downloadPdf() {
  try {
    downloading.value = true
    await new Promise(resolve => setTimeout(resolve, 600))
    success('ID card downloaded')
  } finally {
    downloading.value = false
  }
}

onMounted(() => {
  appStore.setTitle(`${template.value.name} Preview`)
})

definePageMeta({
  role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>