<template>
    <div class="min-h-screen bg-[#F7F8FA] px-4 py-5 sm:px-6 lg:px-7">
        <div class="mx-auto max-w-[1440px] space-y-6">
            <UCard
                :ui="{ body: 'p-0', base: 'overflow-hidden border border-gray-200 dark:border-gray-800 bg-white shadow-sm' }">
                <div class="relative overflow-hidden">
                    <div class="absolute" />
                    <div class="relative flex flex-col gap-5 p-5 sm:p-6 xl:flex-row xl:items-end xl:justify-between">
                        <div class="space-y-3">
                            <div class="flex flex-wrap items-center gap-2">
                                <UBadge color="primary" variant="soft" size="sm" label="HR Dashboard" />
                                <UBadge color="neutral" variant="soft" size="sm"
                                    :label="`${distTotal.toLocaleString()} staff records`" />
                                <UBadge color="success" variant="soft" size="sm" :label="currentDate" />
                            </div>
                            <div class="space-y-1">
                                <p class="text-2xl font-semibold tracking-tight sm:text-[2rem]">Human Resources</p>
                                <p class="max-w-3xl text-sm text-[#64748B] sm:text-base">
                                    One view for staffing, attendance, payroll, leave, compliance, and employee
                                    operations.
                                </p>
                            </div>
                        </div>

                        <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                            <UButton to="/teachers" variant="solid" color="primary" :icon="USERS_ICON"
                                label="Manage Staff" />
                            <UButton to="/teachers/add" variant="outline" color="neutral" :icon="PLUS_ICON"
                                label="Add Employee" />
                            <UButton to="/hr/teacher-attendance" variant="outline" color="neutral"
                                :icon="ATTENDANCE_ICON" label="Teacher Attendance" />
                        </div>
                    </div>
                </div>
            </UCard>

            <section aria-label="Statistics" class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div v-for="s in stats" :key="s.label"
                    :class="['relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-5 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-[3px]', spineColor(s.spine)]">
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <p class="text-[13px] font-medium text-[#64748B]">{{ s.label }}</p>
                            <p class="mt-2 text-[28px] font-semibold tracking-tight text-[#0F2438]">{{ s.value }}</p>
                            <p class="mt-1 text-[12px] text-[#94A3B8]">{{ s.period }}</p>
                        </div>
                        <div
                            :class="['rounded-lg px-2 py-1 text-[11px] font-semibold', s.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700']">
                            {{ s.delta }}
                        </div>
                    </div>
                </div>
            </section>

            <section aria-label="Quick Actions"
                class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-5 shadow-sm sm:p-6">
                <div class="mb-4 flex items-center justify-between gap-3">
                    <div>
                        <h2 class="text-[15px] font-semibold text-[#0F2438]">Quick Actions</h2>
                        <p class="text-[12px] text-[#94A3B8]">Common HR tasks and shortcuts</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                    <button v-for="a in quickActions" :key="a.label"
                        class="flex flex-col items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-4 text-center transition-colors hover:border-[#2563EB]/30 hover:bg-[#2563EB]/[0.03]">
                        <span :class="['grid h-10 w-10 place-items-center rounded-lg text-[18px]',
                            a.color === 'blue' ? 'bg-[#2563EB]/10 text-[#2563EB]' :
                                a.color === 'green' ? 'bg-emerald-50 text-emerald-700' :
                                    a.color === 'amber' ? 'bg-amber-50 text-amber-700' :
                                        a.color === 'navy' ? 'bg-[#0F2438]/5 text-[#0F2438]' :
                                            'bg-slate-100 text-slate-600']">
                            <UIcon :name="a.icon" class="h-5 w-5" />
                        </span>
                        <span class="text-[12.5px] font-medium leading-tight text-[#334155]">{{ a.label }}</span>
                    </button>
                </div>
            </section>

            <section class="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <UCard
                    :class="['relative overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-[3px] xl:col-span-2', spineColor('blue')]">
                    <template #header>
                        <div class="flex items-center justify-between gap-3">
                            <div>
                                <p class="text-[15px] font-semibold text-[#0F2438]">Attendance Chart</p>
                                <p class="text-[12px] text-[#94A3B8]">Daily attendance rate, Mon-Fri</p>
                            </div>
                            <UBadge color="primary" variant="soft" label="Avg 90.6%" />
                        </div>
                    </template>
                    <svg viewBox="0 0 560 160" class="w-full" role="img" aria-label="Weekly attendance line chart">
                        <line v-for="g in [0, 40, 80, 120]" :key="g" x1="24" :y1="g + 8" x2="536" :y2="g + 8"
                            stroke="#EEF1F5" stroke-width="1" />
                        <path :d="attendanceArea" fill="#2563EB" fill-opacity="0.08" />
                        <path :d="attendanceLine" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"
                            stroke-linejoin="round" />
                        <g v-for="p in attendancePoints" :key="p.day">
                            <circle :cx="p.x" :cy="p.y" r="3.5" fill="#2563EB" stroke="white" stroke-width="1.5" />
                            <text :x="p.x" y="154" text-anchor="middle" font-size="11" fill="#94A3B8">{{ p.day }}</text>
                        </g>
                    </svg>
                </UCard>

                <UCard
                    :class="['relative overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-[3px]', spineColor('navy')]">
                    <template #header>
                        <div>
                            <p class="text-[15px] font-semibold text-[#0F2438]">Staff Distribution</p>
                            <p class="text-[12px] text-[#94A3B8]">By department</p>
                        </div>
                    </template>
                    <div class="flex items-center justify-center">
                        <svg viewBox="0 0 180 180" class="h-36 w-36" role="img"
                            aria-label="Staff distribution by department donut chart">
                            <g>
                                <path v-for="d in distArcs" :key="d.label" :d="d.path" :fill="d.color" />
                            </g>
                            <circle cx="90" cy="90" r="42" fill="white" />
                            <text x="90" y="86" text-anchor="middle" font-family="Lexend, sans-serif" font-size="18"
                                font-weight="600" fill="#0F2438">{{ distTotal }}</text>
                            <text x="90" y="102" text-anchor="middle" font-size="10" fill="#94A3B8">employees</text>
                        </svg>
                    </div>
                    <ul class="mt-4 space-y-2">
                        <li v-for="d in distArcs" :key="d.label"
                            class="flex items-center justify-between text-[12.5px]">
                            <span class="flex items-center gap-2 text-[#475569]">
                                <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: d.color }" />
                                {{ d.label }}
                            </span>
                            <span class="font-medium text-[#0F2438]">{{ d.pct }}%</span>
                        </li>
                    </ul>
                </UCard>
            </section>

            <section class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <UCard
                    :class="['relative overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-[3px]', spineColor('amber')]">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-[15px] font-semibold text-[#0F2438]">Leave Requests</p>
                                <p class="text-[12px] text-[#94A3B8]">Pending approvals and recent actions</p>
                            </div>
                            <UButton to="/attendance" variant="ghost" color="neutral" size="sm" label="View all" />
                        </div>
                    </template>
                    <ul class="divide-y divide-[#F1F3F6]">
                        <li v-for="r in leaveRequests" :key="r.name"
                            class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                            <div class="min-w-0">
                                <p class="truncate text-[13.5px] font-medium text-[#0F2438]">{{ r.name }}</p>
                                <p class="truncate text-[12px] text-[#94A3B8]">{{ r.type }} · {{ r.dates }}</p>
                            </div>
                            <span
                                :class="['shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset', statusStyle(r.status)]">
                                {{ r.status }}
                            </span>
                        </li>
                    </ul>
                </UCard>

                <UCard
                    :class="['relative overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-[3px]', spineColor('green')]">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-[15px] font-semibold text-[#0F2438]">Recent Employees</p>
                                <p class="text-[12px] text-[#94A3B8]">Latest staff records</p>
                            </div>
                            <UButton to="/teachers" variant="ghost" color="neutral" size="sm" label="Open list" />
                        </div>
                    </template>
                    <ul class="divide-y divide-[#F1F3F6]">
                        <li v-for="e in recentEmployees" :key="e.name"
                            class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                            <div
                                class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0F2438]/5 text-[12px] font-semibold text-[#0F2438]">
                                {{ e.initials }}</div>
                            <div class="min-w-0 flex-1">
                                <p class="truncate text-[13.5px] font-medium text-[#0F2438]">{{ e.name }}</p>
                                <p class="truncate text-[12px] text-[#94A3B8]">{{ e.role }} · {{ e.dept }}</p>
                            </div>
                            <span class="shrink-0 text-[11.5px] text-[#94A3B8]">{{ e.start }}</span>
                        </li>
                    </ul>
                </UCard>
            </section>



            <section class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <UCard
                    :class="['relative overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-[3px]', spineColor('blue')]">
                    <template #header>
                        <div>
                            <p class="text-[15px] font-semibold text-[#0F2438]">Birthdays</p>
                            <p class="text-[12px] text-[#94A3B8]">Upcoming celebrations</p>
                        </div>
                    </template>
                    <ul class="space-y-3">
                        <li v-for="b in birthdays" :key="b.name" class="flex items-center gap-3">
                            <div
                                class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#2563EB]/10 text-[12px] font-semibold text-[#2563EB]">
                                {{ b.initials }}
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="truncate text-[13.5px] font-medium text-[#0F2438]">{{ b.name }}</p>
                                <p class="truncate text-[12px] text-[#94A3B8]">{{ b.dept }}</p>
                            </div>
                            <span
                                class="shrink-0 rounded-md bg-[#F7F8FA] px-2 py-1 text-[11.5px] font-medium text-[#475569]">{{
                                    b.date }}</span>
                        </li>
                    </ul>
                </UCard>

                <UCard
                    :class="['relative overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-[3px]', spineColor('amber')]">
                    <template #header>
                        <div>
                            <p class="text-[15px] font-semibold text-[#0F2438]">Contracts Expiring Soon</p>
                            <p class="text-[12px] text-[#94A3B8]">Renewals due within the next few weeks</p>
                        </div>
                    </template>
                    <ul class="space-y-3">
                        <li v-for="c in contracts" :key="c.name" class="flex items-center justify-between gap-3">
                            <div class="min-w-0">
                                <p class="truncate text-[13.5px] font-medium text-[#0F2438]">{{ c.name }}</p>
                                <p class="truncate text-[12px] text-[#94A3B8]">{{ c.type }} · expires {{ c.expires }}
                                </p>
                            </div>
                            <span
                                class="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-600/20">
                                {{ c.daysLeft }}d left
                            </span>
                        </li>
                    </ul>
                </UCard>
            </section>

            <section
                :class="['relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-5 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-[3px] sm:p-6', spineColor('navy')]">
                <h2 class="mb-4 text-[15px] font-semibold text-[#0F2438]">Department Overview</h2>
                <div class="overflow-x-auto">
                    <table class="w-full min-w-[560px] text-left text-[13px]">
                        <thead>
                            <tr
                                class="border-b border-gray-200 dark:border-gray-800 text-[11.5px] uppercase tracking-wide text-[#94A3B8]">
                                <th class="pb-3 font-medium">Department</th>
                                <th class="pb-3 font-medium">Lead</th>
                                <th class="pb-3 font-medium">Headcount</th>
                                <th class="pb-3 font-medium">Open Roles</th>
                                <th class="pb-3 font-medium">Utilization</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-[#F1F3F6]">
                            <tr v-for="d in departments" :key="d.name">
                                <td class="py-3 font-medium text-[#0F2438]">{{ d.name }}</td>
                                <td class="py-3 text-[#64748B]">{{ d.lead }}</td>
                                <td class="py-3 text-[#64748B]">{{ d.headcount }}</td>
                                <td class="py-3 text-[#64748B]">{{ d.openRoles }}</td>
                                <td class="py-3">
                                    <div class="flex items-center gap-2">
                                        <div class="h-1.5 w-24 overflow-hidden rounded-full bg-[#F1F3F6]">
                                            <div class="h-full rounded-full bg-[#2563EB]"
                                                :style="{ width: `${d.utilization}%` }" />
                                        </div>
                                        <span class="text-[12px] text-[#475569]">{{ d.utilization }}%</span>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <section
                :class="['relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-5 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-[3px] sm:p-6', spineColor('blue')]">
                <h2 class="mb-4 text-[15px] font-semibold text-[#0F2438]">Upcoming Events</h2>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div v-for="ev in events" :key="ev.title"
                        class="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                        <span
                            class="inline-block rounded-md bg-[#2563EB]/10 px-2 py-0.5 text-[10.5px] font-semibold text-[#2563EB]">{{
                                ev.type }}</span>
                        <p class="mt-2 text-[13.5px] font-medium leading-snug text-[#0F2438]">{{ ev.title }}</p>
                        <p class="mt-1 text-[12px] text-[#94A3B8]">{{ ev.date }} · {{ ev.time }}</p>
                    </div>
                </div>
            </section>

            <section class="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <div
                    :class="['relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-5 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-[3px] lg:col-span-2', spineColor('green')]">
                    <div class="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <h2 class="text-[15px] font-semibold text-[#0F2438]">Payroll Summary</h2>
                            <p class="text-[12px] text-[#94A3B8]">{{ payroll.period }} · pay date {{ payroll.payDate }}
                            </p>
                        </div>
                        <span
                            :class="['rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset', statusStyle(payroll.status)]">{{
                                payroll.status }}</span>
                    </div>

                    <div class="mb-5 grid grid-cols-3 gap-4">
                        <div>
                            <p class="text-[11.5px] text-[#94A3B8]">Gross Pay</p>
                            <p class="font-semibold text-[#0F2438]">{{ payroll.gross }}</p>
                        </div>
                        <div>
                            <p class="text-[11.5px] text-[#94A3B8]">Deductions</p>
                            <p class="font-semibold text-[#0F2438]">{{ payroll.deductions }}</p>
                        </div>
                        <div>
                            <p class="text-[11.5px] text-[#94A3B8]">Net Pay</p>
                            <p class="font-semibold text-[#15803D]">{{ payroll.net }}</p>
                        </div>
                    </div>

                    <div class="h-2.5 w-full overflow-hidden rounded-full bg-[#F1F3F6]">
                        <div class="flex h-full w-full">
                            <div v-for="b in payrollBreakdown" :key="b.label"
                                :style="{ width: `${b.pct}%`, backgroundColor: b.color }" />
                        </div>
                    </div>
                    <ul class="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                        <li v-for="b in payrollBreakdown" :key="b.label"
                            class="flex items-center gap-1.5 text-[12px] text-[#475569]">
                            <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: b.color }" />
                            {{ b.label }} ({{ b.pct }}%)
                        </li>
                    </ul>
                    <p class="mt-4 text-[12px] text-[#94A3B8]">Covers {{ payroll.headcountPaid.toLocaleString() }}
                        employees across
                        6 departments.</p>
                </div>

                <div
                    :class="['relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-5 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-[3px]', spineColor('navy')]">
                    <h2 class="mb-4 text-[15px] font-semibold text-[#0F2438]">Top Performers</h2>
                    <ul class="space-y-4">
                        <li v-for="(p, i) in topPerformers" :key="p.name" class="flex items-center gap-3">
                            <span class="w-4 shrink-0 text-[12px] font-semibold text-[#94A3B8]">{{ i + 1 }}</span>
                            <div
                                class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0F2438]/5 text-[12px] font-semibold text-[#0F2438]">
                                {{ p.initials }}</div>
                            <div class="min-w-0 flex-1">
                                <p class="truncate text-[13.5px] font-medium text-[#0F2438]">{{ p.name }}</p>
                                <p class="truncate text-[12px] text-[#94A3B8]">{{ p.role }}</p>
                            </div>
                            <span class="shrink-0 text-[13px] font-semibold text-[#2563EB]">{{ p.score }}</span>
                        </li>
                    </ul>
                </div>
            </section>

            <section
                :class="['relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white p-5 shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-[3px] sm:p-6', spineColor('amber')]">
                <div class="mb-4 flex items-center justify-between">
                    <div>
                        <h2 class="text-[15px] font-semibold text-[#0F2438]">Documents Requiring Attention</h2>
                        <p class="text-[12px] text-[#94A3B8]">Compliance items and follow-up records</p>
                    </div>
                    <UButton to="/reports" variant="ghost" color="neutral" size="sm" label="View all" />
                </div>
                <ul class="divide-y divide-[#F1F3F6]">
                    <li v-for="doc in documents" :key="doc.name"
                        class="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                        <div class="flex min-w-0 items-center gap-3">
                            <span
                                class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700">
                                <UIcon name="i-heroicons-document-magnifying-glass" class="h-4 w-4" />
                            </span>
                            <div class="min-w-0">
                                <p class="truncate text-[13.5px] font-medium text-[#0F2438]">{{ doc.name }}</p>
                                <p class="truncate text-[12px] text-[#94A3B8]">{{ doc.employee }} · due {{ doc.due }}
                                </p>
                            </div>
                        </div>
                        <span
                            :class="['shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset', statusStyle(doc.severity)]">
                            {{ doc.severity }}
                        </span>
                    </li>
                </ul>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
})

const stats = [
    { label: 'Total Employees', value: '1,284', delta: '+24', trend: 'up', period: 'vs last month', spine: 'navy', icon: 'i-heroicons-user-group' },
    { label: 'Present Today', value: '1,142', delta: '88.9%', trend: 'up', period: 'attendance rate', spine: 'blue', icon: 'i-heroicons-check-circle' },
    { label: 'On Leave', value: '37', delta: '-5', trend: 'down', period: 'vs last week', spine: 'amber', icon: 'i-heroicons-calendar-days' },
    { label: 'Open Positions', value: '19', delta: '+3', trend: 'up', period: 'new this month', spine: 'green', icon: 'i-heroicons-briefcase' },
]

const quickActions = [
    { label: 'Add Employee', icon: 'i-heroicons-user-plus', color: 'blue' },
    { label: 'Run Payroll', icon: 'i-heroicons-banknotes', color: 'green' },
    { label: 'Approve Leave', icon: 'i-heroicons-clipboard-document-check', color: 'amber' },
    { label: 'Post a Job', icon: 'i-heroicons-megaphone', color: 'navy' },
    { label: 'Generate Report', icon: 'i-heroicons-document-chart-bar', color: 'slate' },
]

const attendance = [
    { day: 'Mon', value: 91 },
    { day: 'Tue', value: 94 },
    { day: 'Wed', value: 89 },
    { day: 'Thu', value: 93 },
    { day: 'Fri', value: 86 },
]

const attendanceMax = 100
const attendancePoints = computed(() => {
    const w = 560
    const h = 160
    const pad = 24
    const stepX = (w - pad * 2) / (attendance.length - 1)

    return attendance.map((d, i) => {
        const x = pad + i * stepX
        const y = h - pad - (d.value / attendanceMax) * (h - pad * 1.6)
        return { x, y, ...d }
    })
})
const attendanceLine = computed(() =>
    attendancePoints.value.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
)
const attendanceArea = computed(() => {
    const pts = attendancePoints.value
    const first = pts[0]
    const last = pts[pts.length - 1]
    return `${attendanceLine.value} L ${last.x} 136 L ${first.x} 136 Z`
})

const distribution = [
    { label: 'Engineering', value: 412, color: '#2563EB' },
    { label: 'Sales', value: 268, color: '#0F2438' },
    { label: 'Operations', value: 221, color: '#15803D' },
    { label: 'Customer Support', value: 174, color: '#B45309' },
    { label: 'Marketing', value: 119, color: '#7C3AED' },
    { label: 'People & Finance', value: 90, color: '#94A3B8' },
]
const distTotal = computed(() => distribution.reduce((sum, item) => sum + item.value, 0))
const distArcs = computed(() => {
    let acc = 0
    const r = 70
    const cx = 90
    const cy = 90

    return distribution.map((d) => {
        const frac = d.value / distTotal.value
        const startAngle = acc * 2 * Math.PI - Math.PI / 2
        acc += frac
        const endAngle = acc * 2 * Math.PI - Math.PI / 2
        const x1 = cx + r * Math.cos(startAngle)
        const y1 = cy + r * Math.sin(startAngle)
        const x2 = cx + r * Math.cos(endAngle)
        const y2 = cy + r * Math.sin(endAngle)
        const largeArc = frac > 0.5 ? 1 : 0

        return {
            path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
            ...d,
            pct: Math.round(frac * 100)
        }
    })
})

const leaveRequests = [
    { name: 'Amara Bangura', dept: 'Engineering', type: 'Annual Leave', dates: 'Jun 24 – Jun 28', status: 'Pending' },
    { name: 'Foday Conteh', dept: 'Sales', type: 'Sick Leave', dates: 'Jun 21 – Jun 22', status: 'Pending' },
    { name: 'Isata Kamara', dept: 'Marketing', type: 'Maternity Leave', dates: 'Jul 01 – Sep 23', status: 'Approved' },
    { name: 'Mohamed Sesay', dept: 'Operations', type: 'Annual Leave', dates: 'Jun 30 – Jul 04', status: 'Pending' },
]

const teacherAttendanceTerms = [
    { label: 'Current Week', value: 'current-week' },
    { label: 'Last Week', value: 'last-week' },
    { label: 'This Month', value: 'this-month' },
]
const selectedTeacherAttendanceTerm = ref('current-week')
const teacherAttendanceSummary = computed(() => ({
    present: 38,
    late: 4,
    absent: 3,
    rate: '88.4%'
}))
const teacherAttendances = [
    { date: 'Monday, 17 Jun 2026', reason: 'On time for morning briefing', state: 'Present' },
    { date: 'Tuesday, 18 Jun 2026', reason: 'Checked in after class setup', state: 'Late' },
    { date: 'Wednesday, 19 Jun 2026', reason: 'Sick leave approved by admin', state: 'Absent' },
    { date: 'Thursday, 20 Jun 2026', reason: 'On-site before 7:30 AM', state: 'Present' },
    { date: 'Friday, 21 Jun 2026', reason: 'No remarks', state: 'Present' },
]

const recentEmployees = [
    { name: 'Fatmata Koroma', role: 'Product Designer', dept: 'Engineering', start: 'Jun 16, 2026', initials: 'FK' },
    { name: 'Abdul Rahman Jalloh', role: 'Account Executive', dept: 'Sales', start: 'Jun 12, 2026', initials: 'AJ' },
    { name: 'Mariama Turay', role: 'Payroll Specialist', dept: 'People & Finance', start: 'Jun 09, 2026', initials: 'MT' },
    { name: 'Ibrahim Kallon', role: 'Backend Engineer', dept: 'Engineering', start: 'Jun 03, 2026', initials: 'IK' },
]

const birthdays = [
    { name: 'Aminata Sesay', date: 'Jun 22', dept: 'Customer Support', initials: 'AS' },
    { name: 'Joseph Kargbo', date: 'Jun 24', dept: 'Engineering', initials: 'JK' },
    { name: 'Hawa Bah', date: 'Jun 27', dept: 'Marketing', initials: 'HB' },
]

const contracts = [
    { name: 'Samuel Vandi', type: 'Fixed-Term', expires: 'Jun 30, 2026', daysLeft: 10 },
    { name: 'Yeabu Sankoh', type: 'Probation', expires: 'Jul 05, 2026', daysLeft: 15 },
    { name: 'Lamin Touray', type: 'Fixed-Term', expires: 'Jul 18, 2026', daysLeft: 28 },
]

const departments = [
    { name: 'Engineering', headcount: 412, openRoles: 7, lead: 'Aruna Sheriff', utilization: 94 },
    { name: 'Sales', headcount: 268, openRoles: 5, lead: 'Zainab Dumbuya', utilization: 88 },
    { name: 'Operations', headcount: 221, openRoles: 2, lead: 'Patrick Kposia', utilization: 91 },
    { name: 'Customer Support', headcount: 174, openRoles: 3, lead: 'Ramatu Sillah', utilization: 85 },
    { name: 'Marketing', headcount: 119, openRoles: 1, lead: 'Tejan Bockarie', utilization: 90 },
    { name: 'People & Finance', headcount: 90, openRoles: 1, lead: 'Adama Fofanah', utilization: 96 },
]

const events = [
    { title: 'Quarterly All-Hands', date: 'Jun 23', time: '10:00 AM', type: 'Company' },
    { title: 'New Hire Orientation', date: 'Jun 25', time: '9:00 AM', type: 'Onboarding' },
    { title: 'Performance Review Cycle Opens', date: 'Jul 01', time: 'All Day', type: 'HR Process' },
    { title: 'Wellness Week', date: 'Jul 06', time: 'All Week', type: 'Culture' },
]

const payroll = {
    period: 'June 2026',
    gross: 'Le 4,218,000,000',
    net: 'Le 3,602,400,000',
    deductions: 'Le 615,600,000',
    status: 'Processing',
    payDate: 'Jun 28, 2026',
    headcountPaid: 1284,
}

const payrollBreakdown = [
    { label: 'Base Salaries', pct: 72, color: '#2563EB' },
    { label: 'Bonuses & Allowances', pct: 14, color: '#15803D' },
    { label: 'Taxes & Statutory', pct: 11, color: '#B45309' },
    { label: 'Benefits', pct: 3, color: '#94A3B8' },
]

const topPerformers = [
    { name: 'Zainab Dumbuya', role: 'VP Sales', score: 98, initials: 'ZD' },
    { name: 'Aruna Sheriff', role: 'Eng. Director', score: 96, initials: 'AS' },
    { name: 'Mariatu Conteh', role: 'Senior Designer', score: 94, initials: 'MC' },
    { name: 'David Squire', role: 'Account Manager', score: 93, initials: 'DS' },
]

const documents = [
    { name: 'Q2 Compliance Audit', employee: 'All Departments', due: 'Jun 25, 2026', severity: 'High' },
    { name: 'Updated Tax ID Form', employee: 'Samuel Vandi', due: 'Jun 26, 2026', severity: 'Medium' },
    { name: 'Signed Offer Letter', employee: 'Fatmata Koroma', due: 'Jun 21, 2026', severity: 'High' },
    { name: 'Work Permit Renewal', employee: 'David Squire', due: 'Jul 02, 2026', severity: 'Medium' },
]

const aiInsights = [
    { text: 'Friday attendance has dropped 8% over the last 3 weeks — Engineering and Sales account for most of the dip.', tag: 'Attendance Pattern' },
    { text: '3 contracts expire within 30 days with no renewal action started. Operations team has the highest renewal risk.', tag: 'Contract Risk' },
    { text: 'Customer Support headcount is trending toward 95% utilization. Consider opening 2 additional roles before Q3.', tag: 'Capacity Forecast' },
]

const spineColor = (key: string) => ({
    navy: 'before:bg-[#0F2438]',
    blue: 'before:bg-[#2563EB]',
    amber: 'before:bg-[#B45309]',
    green: 'before:bg-[#15803D]',
    slate: 'before:bg-[#94A3B8]',
}[key] ?? 'before:bg-[#2563EB]')

const getAttendanceStatusColor = (status: string) => {
    switch (status) {
        case 'Present':
            return 'success'
        case 'Late':
            return 'warning'
        default:
            return 'error'
    }
}

const statusStyle = (status: string) => ({
    Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Rejected: 'bg-red-50 text-red-700 ring-red-600/20',
    Processing: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    High: 'bg-red-50 text-red-700 ring-red-600/20',
    Medium: 'bg-amber-50 text-amber-700 ring-amber-600/20',
}[status] ?? 'bg-slate-50 text-slate-700 ring-slate-600/20')

onMounted(() => {
    useAppStore().setTitle('HR')
    document.title = 'HR | Skultem'
})

definePageMeta({
    role: [Role.ADMIN, Role.PROPRIETOR, Role.OWNER]
})
</script>
