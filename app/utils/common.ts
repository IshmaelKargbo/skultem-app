export type Meta = {
    size: number;
    page: number;
    total: number;
    showingFrom: number;
    showingTo: number;
    totalPages: number;
}

export enum Level {
    Primary = 'Primary',
    JSS = 'JSS',
    SSS = 'SSS',
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

export const levels = [
    { label: 'Primary', value: Level.Primary },
    { label: 'JSS', value: Level.JSS },
    { label: 'SSS', value: Level.SSS },
]

export const parseLevel: Record<string, string> = {
    'PRIMARY': 'Primary',
    'JSS': 'JSS',
    'SSS': 'SSS'
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
