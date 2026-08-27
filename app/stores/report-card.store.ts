import { defineStore } from 'pinia'

export interface ReportCardAssessmentScore {
    name: string
    score: number
    weight: number
    level: number | null
}

export interface ReportCardSubject {
    subject: string
    teacher: string
    score: number
    weight: number
    weightScore: number
    grade: string
    // Null for report cards generated before this field existed - re-generate
    // to backfill the breakdown, the combined score/grade above still hold.
    assessments: ReportCardAssessmentScore[] | null
}

export interface ReportCardSummary {
    id: string
    studentId: string
    studentName: string
    admissionNumber: string
    photo: string
    className: string
    termName: string
    academicYearName: string
    average: number
    position: number
    overallGrade: string
    passed: boolean
    downloadCount: number
    generatedAt: string
}

export interface ReportCardDetail extends ReportCardSummary {
    classId: string
    classSize: number
    termId: string
    attendancePercentage: number | null
    remark: string | null
    subjects: ReportCardSubject[]
    school: {
        id: string
        name: string
        logo: string
        principalName: string
        principalSignature: string
        address: { street?: string, city?: string, chiefdom?: string, district?: string, region?: string } | null
        owner: { givenNames: string, familyName: string, email: string, phone: string } | null
        gradingScale: { minScore: number, maxScore: number, grade: string }[]
    }
    settings: {
        headerColor: string
        logoUrl: string
        footerNote: string
        showAttendance: boolean
        showRemarks: boolean
        showPosition: boolean
        showSignatures: boolean
        showGradeScale: boolean
    }
}

export interface ReportCardStats {
    total: number
    passed: number
    failed: number
    downloads: number
}

export const useReportCardStore = defineStore('reportCard', {
    state: () => ({
        records: [] as ReportCardSummary[],
        meta: { total: 0, size: 12, page: 1, showingFrom: 0, showingTo: 0, totalPages: 0 },
        stats: null as ReportCardStats | null,
        loading: false,
        generating: false
    }),

    actions: {
        async fetchAll(page: number, size: number, filters?: { classId?: string, termId?: string, search?: string }) {
            this.loading = true
            try {
                const res = await ReportCardApi().fetchAll(page, size, filters)
                if (!res) return

                this.records = res.data || []
                this.meta = res.meta
            } finally {
                this.loading = false
            }
        },

        async fetchStats() {
            this.stats = await ReportCardApi().stats()
        },

        async generate(payload: { classId: string, termId: string, includeAttendance: boolean, includeRanking: boolean }) {
            this.generating = true
            try {
                return await ReportCardApi().generate(payload)
            } finally {
                this.generating = false
            }
        },

        async get(id: string): Promise<ReportCardDetail | undefined> {
            return await ReportCardApi().get(id)
        },

        async updateRemark(id: string, remark: string) {
            return await ReportCardApi().updateRemark(id, remark)
        },

        async trackDownload(id: string) {
            await ReportCardApi().trackDownload(id)
        }
    }
})
