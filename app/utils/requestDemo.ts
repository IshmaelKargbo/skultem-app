export type CreateRequestDemoPayload = {
    name: string
    school: string
    address: string
    city: string
    email: string
    phone: string
    preferred: string
    priority: string
    message: string
}

export type DemoRequest = CreateRequestDemoPayload & {
    id: string
    createdAt: string
    updatedAt: string
    // The lead (status, owner, demo date) this request was made into.
    lead?: Lead | null
}

export const demoWalkthroughFormats = [
    { label: 'Video call', value: 'Video call' },
    { label: 'In person', value: 'In person' },
    { label: 'Self-guided demo', value: 'Self-guided demo' }
]

export const demoPriorities = [
    { label: 'Student & class management', value: 'Student & class management' },
    { label: 'Fees & payments', value: 'Fees & payments' },
    { label: 'Grades & report cards', value: 'Grades & report cards' },
    { label: 'Attendance', value: 'Attendance' },
    { label: 'Parent communication', value: 'Parent communication' },
    { label: 'Something else', value: 'Something else' }
]
