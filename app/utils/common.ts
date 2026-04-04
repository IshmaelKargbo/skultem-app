export const TITLE = "Skultem"

export type Meta = {
    size: number;
    page: number;
    total: number;
    showingFrom: number;
    showingTo: number;
    totalPages: number;
}


export const parseFeeStatusColor: Record<string, string> = {
    Paid: 'success',
    Pending: 'error',
    Partial: 'info'
}

export const parseFeeStatusIcon: Record<string, string> = {
    Pending: 'i-lucide-clock',
    Paid: 'i-lucide-check-circle',
    Partial: 'ph:circle-half-tilt-duotone',
}

export enum Level {
    Primary = 'Primary',
    JSS = 'JSS',
    SSS = 'SSS',
}

export const parseTrend = {
    Improved: {
        icon: IMPROVED_ICON,
        color: 'success'
    },
    Stable: {
        icon: STABLE_ICON,
        color: 'neutral'
    },
    Dropped: {
        icon: DROPPED_ICON,
        color: 'error'
    }
}

export function generateColors(count: number) {
    return Array.from({ length: count }, (_, i) =>
        `hsl(${Math.floor(Math.random() * 360)},70%,55%)`
    )
}

export enum Role {
    PROPRIETOR = 'PROPRIETOR',
    ADMIN = 'ADMIN',
    TEACHER = 'TEACHER',
    PARENT = 'PARENT',
    ACCOUNTANT = 'ACCOUNTANT'
}

export const roles = [
    {
        label: 'Admin',
        value: Role.ADMIN.toString()
    },
    {
        label: 'Accountant',
        value: Role.ACCOUNTANT.toString()
    }
]

export const directionOptions = [
    {
        label: 'Credit',
        value: "CREDIT"
    },
    {
        label: 'Decit',
        value: "DEBIT"
    }
]

export const typeOptions = [
    {
        label: 'Fee Assignment',
        value: "FEE_ASSIGNMENT"
    },
    {
        label: 'Payment',
        value: "PAYMENT"
    },
    {
        label: 'Discount',
        value: "DISCOUNT"
    },
    {
        label: 'Expense',
        value: "EXPENSE"
    },
    {
        label: 'Adjustment',
        value: "ADJUSTMENT"
    }
]

export const monthOrder: Record<string, number> = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
}

export const referenceTypeOptions = [
    {
        label: 'Student',
        value: "STUDENT"
    },
    {
        label: 'Expense',
        value: "EXPENSE"
    },
    {
        label: 'System',
        value: "SYSTEM"
    },
    {
        label: 'Other',
        value: "OTHER"
    }
]

export const paymentMethods = {
  BANK: {
    label: 'Bank',
    color: 'success',
    icon: 'mdi-bank'
  },
  MOBILE_MONEY: {
    label: 'Mobile Money',
    color: 'info',
    icon: 'mdi-cellphone'
  },
  CASH: {
    label: 'Cash',
    color: 'neutral',
    icon: 'mdi-cash'
  },
}

export const parseRole: Record<string, string> = {
    PROPRIETOR: 'Proprietor',
    ADMIN: 'Admin',
    TEACHER: 'Teacher',
    PARENT: 'Parent',
    ACCOUNTANT: 'Accounttant'
}

export const parseRoleColor: Record<string, string> = {
    PROPRIETOR: 'success',
    ADMIN: 'info',
    TEACHER: 'neutral',
    PARENT: 'primary',
    ACCOUNTANT: 'error'
}

export const parseRoleIcon: Record<string, string> = {
    ADMIN: 'fluent:building-24-regular',
    PROPRIETOR: 'fluent:crown-24-regular',
    TEACHER: 'fluent:hat-graduation-24-regular',
    PARENT: 'fluent:people-24-regular',
    ACCOUNTANT: 'fluent:calculator-24-regular'
}

export function clean(str: string) {
    return str
        .toLowerCase()
        .split("_")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

export type AssignmentSubject = {
    subjectId: string
    groupId: string
    mandatory: boolean
    locked?: boolean
}

export type AssignmentTeacherSubject = {
    id: string
    subjectId: string
    teacherId: string
}

export const runtimeConf = () => {
    return { limit: Number.parseInt(useRuntimeConfig().public.limit) }
}

export const parseGenderColor: Record<string, string> = {
    MALE: 'success',
    FEMALE: 'info'
}


export type Option = {
    label: string
    value: string
}

export const levels = [
    { label: 'Primary', value: Level.Primary },
    { label: 'JSS', value: Level.JSS },
    { label: 'SSS', value: Level.SSS },
]

export function handleScroll(event: Event) {
    const target = event.target as HTMLElement
    const scrollTop = target.scrollTop
    const scrollHeight = target.scrollHeight
    const clientHeight = target.clientHeight

    if (scrollTop + clientHeight >= scrollHeight - 10) {
        console.log("Reached bottom!")
    }
}

export const parseLevel: Record<string, string> = {
    'PRIMARY': 'Primary',
    'JSS': 'JSS',
    'SSS': 'SSS'
}

export const parseGender: Record<string, string> = {
    'MALE': 'Male',
    'FEMALE': 'Female'
}

export const genderOption: Option[] = [
    {
        label: 'Male',
        value: 'MALE'
    },
    {
        label: 'Female',
        value: 'FEMALE'
    }
]

export const parseBehaviourKind: Record<string, string> = {
    'POSITIVE': 'Positive',
    'NEGATIVE': 'Negative',
    'NEUTRAL': 'Neutral'
}

export const parseBehaviourKindColor: Record<string, string> = {
    'POSITIVE': 'success',
    'NEGATIVE': 'error',
    'NEUTRAL': 'neutral'
}

export const parseTitle: Record<string, string> = {
    MR: 'Mr.',
    MRS: 'Mrs.',
    MISS: 'Miss',
    MS: 'Ms.',
    DR: 'Dr.',
    PROF: 'Prof.',
    REV: 'Rev.',
    HON: 'Hon.',
    ENG: 'Eng.',
    SIR: 'Sir',
    MADAM: 'Madam'
}

export function parseClass(clazz: Enrollment) {
    let value = `${clazz.clazz.name} ( ${clazz.section.name} )`

    if (!clazz.stream) return value;
    return `${clazz.clazz.name} ( ${clazz.section.name} - ${clazz.stream.name} )`
}


export function parseClassSession(clazz: ClassSession) {
    let value = `${clazz.clazz} (${clazz.sectionName})`

    if (!clazz.streamId) return value;
    return `${clazz.clazz} (${clazz.sectionName} - ${clazz.streamName})`
}

export function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

export function formatDateString(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toDateString()
}

export function formatDateTime(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export const useMoney = () => {
    const format = (value: number) =>
        new Intl.NumberFormat('en-SL', { style: 'currency', currency: 'NLE', minimumFractionDigits: 2 }).format(value)

    return { format }
}

export function useMeta(meta: any) {
    const showingFrom = meta.count === 0 ? 0 : (meta.page - 1) * meta.size + 1
    const showingTo = meta.page * meta.size < meta.count ? meta.page * meta.size : meta.count

    return {
        total: meta.count,
        size: meta.size,
        page: meta.page,
        showingFrom: showingFrom,
        showingTo: showingTo,
        totalPages: Math.ceil(meta.count / meta.size)
    }
}

export const useHandleError = (err: any) => {
    const validationErrors = err?.data?.errors || err?.response?._data?.errors
    if (validationErrors && typeof validationErrors === 'object') {
        const fieldMessages = Object.values(validationErrors).join(', ')
        throw new Error(fieldMessages)
    }

    const message =
        err?.data?.message ||
        err?.response?._data?.message ||
        err?.message ||
        'Something went wrong'

    throw new Error(message)
}

export const parsePaymentMethod: Record<string, string> = {
    "CASH": "Cash",
    "BANK": "Bank",
    "MOBILE_MONEY": "Mobile Money"
}
