import { defineStore } from 'pinia'
import type { AcademicReportFilters } from '~/api/academic-report.api'

export interface AcademicOverview {
  totalStudents: number
  studentsAssessed: number
  totalAssessments: number
  completedAssessments: number
  classAverage: number
  passRate: number
  studentsNeedingSupport: number
  // The pass mark the figures above were measured against; null when the classes in a whole-school
  // report use different assessment templates, so there's no single one to show.
  passMark: number | null
}

export interface ClassPerformance {
  classId: string
  className: string
  totalStudents: number
  studentsAssessed: number
  studentsNotAssessed: number
  averageScore: number
  passRate: number
}

export interface GradeCount {
  grade: string
  count: number
}

export interface SubjectPerformance {
  subjectId: string
  subjectName: string
  averageScore: number
  medianScore: number
  highestScore: number
  lowestScore: number
  passRate: number
  studentsAssessed: number
  passCount: number
  failCount: number
  gradeDistribution: GradeCount[]
}

export interface StudentSubjectScore {
  subjectId: string
  subjectName: string
  averageScore: number
}

export interface StudentAcademicPerformance {
  studentId: string
  enrollmentId: string
  givenNames: string
  familyName: string
  subjects: StudentSubjectScore[]
  overallAverage: number
  assessmentsCompleted: number
  assessmentsMissing: number
}

export interface AcademicReport {
  overview: AcademicOverview
  classes: ClassPerformance[]
  subjects: SubjectPerformance[]
  students: StudentAcademicPerformance[]
  studentsPage: number
  studentsSize: number
  studentsTotal: number
}

export type PerformanceTrend = 'IMPROVING' | 'DECLINING' | 'STABLE' | 'INSUFFICIENT_DATA'

export interface PerformanceTrendPoint {
  label: string
  score: number
}

export interface StudentPerformanceTrend {
  trend: PerformanceTrend
  points: PerformanceTrendPoint[]
}

export interface AssessmentCompletionRow {
  classId: string
  className: string
  subjectId: string
  subjectName: string
  assessmentId: string
  assessmentName: string
  status: 'DRAFT' | 'SUBMITTED' | 'RETURNED' | 'APPROVED' | 'COMPLETED' | 'LOCKED'
}

export interface StudentAcademicAttention {
  studentId: string
  enrollmentId: string
  givenNames: string
  familyName: string
  photo: string | null
  academicAverage: number | null
  attendanceRate: number | null
  assessmentsMissing: number
  trend: PerformanceTrend
  lowAcademicSignal: boolean
  lowAttendanceSignal: boolean
  missingAssessmentsSignal: boolean
  decliningTrendSignal: boolean
}

export interface ClassAcademicAttention {
  totalStudents: number
  flaggedCount: number
  page: number
  size: number
  students: StudentAcademicAttention[]
}

export interface WeeklyGenderAttendanceDay {
  date: string
  dayLabel: string
  boysPresent: number
  boysAbsent: number
  girlsPresent: number
  girlsAbsent: number
  boysAttendancePercentage: number
  girlsAttendancePercentage: number
  overallAttendancePercentage: number
}

export interface WeeklyGenderAttendance {
  classId: string
  className: string
  weekStart: string
  weekEnd: string
  boysEnrolled: number
  girlsEnrolled: number
  days: WeeklyGenderAttendanceDay[]
  overallAttendancePercentage: number
  boysAttendancePercentage: number
  girlsAttendancePercentage: number
}

export interface ReligionCount {
  label: string
  count: number
}

export interface StudentDemographics {
  totalStudents: number
  boys: number
  girls: number
  genderNotSpecified: number
  religions: ReligionCount[]
}

export const useAcademicReportStore = defineStore('academicReport', {
  state: () => ({
    report: null as AcademicReport | null,
    loadingReport: false,

    trend: null as StudentPerformanceTrend | null,
    loadingTrend: false,

    academicTrend: null as StudentPerformanceTrend | null,
    loadingAcademicTrend: false,

    completion: [] as AssessmentCompletionRow[],
    completionMeta: null as { page: number, size: number, count: number } | null,
    loadingCompletion: false,

    attention: null as ClassAcademicAttention | null,
    loadingAttention: false,

    weeklyGenderAttendance: null as WeeklyGenderAttendance | null,
    loadingWeeklyGenderAttendance: false,

    demographics: null as StudentDemographics | null,
    loadingDemographics: false
  }),

  actions: {
    async fetchReport(filters: AcademicReportFilters) {
      this.loadingReport = true
      try {
        const res = await AcademicReportApi().getReport(filters)
        this.report = res?.data || null
      } finally {
        this.loadingReport = false
      }
    },

    async fetchStudentTrend(enrollmentId: string, termId: string) {
      this.loadingTrend = true
      try {
        this.trend = await AcademicReportApi().getStudentTrend(enrollmentId, termId) || null
      } finally {
        this.loadingTrend = false
      }
    },

    async fetchAcademicTrend(filters: { classId?: string, subjectId?: string, academicYearId?: string, termId?: string }) {
      this.loadingAcademicTrend = true
      try {
        this.academicTrend = await AcademicReportApi().getAcademicTrend(filters) || null
      } finally {
        this.loadingAcademicTrend = false
      }
    },

    async fetchCompletionReport(filters: AcademicReportFilters) {
      this.loadingCompletion = true
      try {
        const res = await AcademicReportApi().getCompletionReport(filters)
        this.completion = res?.data || []
        this.completionMeta = res?.meta || null
      } finally {
        this.loadingCompletion = false
      }
    },

    async fetchStudentsRequiringAttention(filters: { classId?: string, academicYearId?: string, termId?: string, level?: string, page?: number, size?: number }) {
      this.loadingAttention = true
      try {
        const res = await AcademicReportApi().getStudentsRequiringAttention(filters)
        this.attention = res?.data || null
      } finally {
        this.loadingAttention = false
      }
    },

    async fetchWeeklyGenderAttendance(classId: string, filters: { academicYearId?: string, weekOf?: string }) {
      this.loadingWeeklyGenderAttendance = true
      try {
        this.weeklyGenderAttendance = await AcademicReportApi().getWeeklyGenderAttendance(classId, filters) || null
      } finally {
        this.loadingWeeklyGenderAttendance = false
      }
    },

    async fetchDemographics(filters: { academicYearId?: string, classId?: string, level?: string }) {
      this.loadingDemographics = true
      try {
        this.demographics = await AcademicReportApi().getDemographics(filters) || null
      } finally {
        this.loadingDemographics = false
      }
    }
  }
})
