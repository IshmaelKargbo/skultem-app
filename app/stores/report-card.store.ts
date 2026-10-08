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
    assessments: ReportCardAssessmentScore[] | null
    // Whole-year cards: the subject's score per term; `score` is then the final, year score.
    termScores?: { term: string, score: number }[] | null
}

export type GenerateReportCardPayload = {
    classId: string
    termId?: string
    includeAttendance: boolean
    includeRanking: boolean
    // Only these assessments count; empty = all of the term's.
    assessmentIds?: string[]
    // Every term of the term's academic year.
    wholeYear?: boolean
    // With wholeYear: the academic year to cover (termId isn't needed then).
    academicYearId?: string
    // Just this section / stream of the class (JSS 1 A) - blank = the whole class.
    sectionId?: string
    streamId?: string
}

export type ReportCardFilters = {
    classId?: string
    termId?: string
    search?: string
    level?: string
    sectionId?: string
    streamId?: string
}

export type ReportCardAssessmentOption = { id: string, name: string, weight: number, position: number }

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
    // Which slice the card covers: "First Test + Second Test", "All terms", or null for the whole term.
    scopeLabel: string | null
}

export interface ReportCardDetail extends ReportCardSummary {
    classId: string
    // Level of the card's class - picks which management section's logo/principal the card prints.
    level: string | null
    classSize: number
    termId: string
    attendancePercentage: number | null
    // The class master's own remark, written on top of the automatic one.
    remark: string | null
    // Picked from the school's remark score ranges for this card's average; null when none matches.
    gradeRemark: string | null
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
        showTeacherSignature: boolean
        showPrincipalSignature: boolean
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
        generating: false,

        // A single student's own report cards (all terms/years) - the Report Card tab on their
        // profile, kept separate from the admin list page's paginated `records` above.
        studentRecords: [] as ReportCardSummary[],
        loadingStudent: false
    }),

    actions: {
        async fetchByStudent(studentId: string) {
            this.loadingStudent = true
            try {
                this.studentRecords = await ReportCardApi().byStudent(studentId) || []
            } finally {
                this.loadingStudent = false
            }
        },

        async fetchAll(page: number, size: number, filters?: ReportCardFilters) {
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

        async generate(payload: GenerateReportCardPayload) {
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
