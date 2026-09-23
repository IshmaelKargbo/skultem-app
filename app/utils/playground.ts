// Playground mode - a school a system admin has flagged to try the system out before going live
// (see backend PlaygroundDataCategory / WipeTestSchoolDataUseCase). Going live clears whichever of
// these categories the school picks; its setup (classes, subjects, fee structures, staff...) is
// never touched.
export type PlaygroundCategoryKey =
    | 'STUDENTS'
    | 'FEES'
    | 'ASSESSMENTS'
    | 'ATTENDANCE'
    | 'BEHAVIOUR'
    | 'MATERIALS'
    | 'EXPENSES'
    | 'PAYROLL'
    | 'STAFF_ATTENDANCE'
    | 'COMMUNICATION'
    | 'NOTIFICATIONS'
    | 'SUBJECT_SETUP'
    | 'CLASS_SETUP'

export type PlaygroundCategory = {
    key: PlaygroundCategoryKey
    // Label -> row count, in display order (e.g. { Students: 42, Guardians: 30 }).
    counts: Record<string, number>
    // Categories that get cleared along with this one - wiping students can't leave their
    // payments or marks pointing at nothing.
    requires: PlaygroundCategoryKey[]
}

export type PlaygroundSummary = {
    schoolId: string
    schoolName: string
    domain: string
    testSchool: boolean
    categories: PlaygroundCategory[]
}

export type GoLivePayload = {
    categories: PlaygroundCategoryKey[]
    // Must match the school's domain.
    confirmation: string
}

// Display copy and order for each category - the backend only sends keys and counts.
// A named type rather than an inline one on the constant below: Nuxt's auto-import scanner reads
// `export const X: Record<K, { a, b }>` as destructured exports and would auto-import `setup` etc.
export type PlaygroundCategoryMeta = {
    label: string
    description: string
    icon: string
    // The school's own configuration, as opposed to records made while testing - never ticked by
    // default (nor by "Select all"), only when the school opts in.
    setup?: boolean
}

export const PLAYGROUND_CATEGORY_META: Record<PlaygroundCategoryKey, PlaygroundCategoryMeta> = {
    STUDENTS: {
        label: 'Students & guardians',
        description: 'Every student, guardian, enrollment and promotion request. Guardians lose access to this school.',
        icon: 'i-lucide-graduation-cap'
    },
    FEES: {
        label: 'Fee payments',
        description: 'Payments, discounts and refunds. Fees charged to students you keep stay on their accounts.',
        icon: 'i-lucide-wallet'
    },
    ASSESSMENTS: {
        label: 'Marks & report cards',
        description: 'Marks entered, grade-sheet approvals and generated report cards. Grade sheets reset to draft.',
        icon: 'i-lucide-clipboard-check'
    },
    ATTENDANCE: {
        label: 'Student attendance',
        description: 'Every attendance record taken for students.',
        icon: 'i-lucide-calendar-check'
    },
    BEHAVIOUR: {
        label: 'Behaviour records',
        description: 'Merits, demerits and incident notes.',
        icon: 'i-lucide-shield-alert'
    },
    MATERIALS: {
        label: 'Material sales & issues',
        description: 'Sales and items issued to students, including those owed from fee payments. Issued stock is put back on the shelf.',
        icon: 'i-lucide-package'
    },
    EXPENSES: {
        label: 'Expenses',
        description: 'Recorded expenses and their transactions.',
        icon: 'i-lucide-receipt'
    },
    PAYROLL: {
        label: 'Payroll runs',
        description: 'Payroll runs, payslips and salary payments. Salary structures stay.',
        icon: 'i-lucide-banknote'
    },
    STAFF_ATTENDANCE: {
        label: 'Staff clock-ins & leave',
        description: 'Staff clock-in history and leave requests.',
        icon: 'i-lucide-clock'
    },
    COMMUNICATION: {
        label: 'Notices, broadcasts & events',
        description: 'Posted notices, sent broadcasts and calendar events.',
        icon: 'i-lucide-megaphone'
    },
    NOTIFICATIONS: {
        label: 'Notifications & activity feed',
        description: 'In-app notifications and the dashboard activity feed.',
        icon: 'i-lucide-bell'
    },
    SUBJECT_SETUP: {
        label: 'Subject setup',
        description: 'Class subjects, teacher assignments, subject groups and the timetable. Subjects themselves stay. Marks and report cards go too, as grade sheets are built on teacher assignments.',
        icon: 'i-lucide-book-open',
        setup: true
    },
    CLASS_SETUP: {
        label: 'Classes, sections & streams',
        description: 'Every class, section and stream, with the class fee structures, class masters, timetable periods and schemes of work tied to them. Students and subject setup go too.',
        icon: 'i-lucide-school',
        setup: true
    }
}

export const PLAYGROUND_CATEGORY_ORDER = Object.keys(PLAYGROUND_CATEGORY_META) as PlaygroundCategoryKey[]
