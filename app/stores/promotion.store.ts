import { defineStore } from 'pinia'

function uid() {
    return Math.random().toString(36).slice(2, 10)
}

function daysFromNow(days: number) {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString()
}

function seedStudent(i: number, name: string, outcome: PromotionOutcome, targetClassName: string | null): PromotionCandidate {
    return {
        studentId: `seed-${i}`,
        enrollmentId: `seed-enr-${i}`,
        name,
        admissionNumber: `SKT-${(2000 + i).toString()}`,
        outcome,
        targetClassId: targetClassName ? 'seed-target' : null,
        targetClassName
    }
}

const seedBatches: PromotionBatch[] = [
    {
        id: 'pb-1',
        fromClassId: '',
        fromClassName: 'JSS 2A',
        toClassName: 'JSS 3A',
        promotedCount: 27,
        repeatedCount: 2,
        graduatedCount: 0,
        totalCount: 29,
        performedBy: 'School Administration',
        performedAt: daysFromNow(-180),
        isDemo: true,
        students: [
            seedStudent(1, 'Aminata Kamara', 'PROMOTE', 'JSS 3A'),
            seedStudent(2, 'Foday Sesay', 'PROMOTE', 'JSS 3A'),
            seedStudent(3, 'Ibrahim Bangura', 'REPEAT', null),
            seedStudent(4, 'Isata Conteh', 'REPEAT', null),
            seedStudent(5, 'Mohamed Turay', 'PROMOTE', 'JSS 3A')
        ]
    }
]

const demoNames = [
    ['Aminata', 'Kamara'],
    ['Foday', 'Sesay'],
    ['Ibrahim', 'Bangura'],
    ['Isata', 'Conteh'],
    ['Mohamed', 'Turay'],
    ['Fatmata', 'Koroma'],
    ['Alusine', 'Kargbo'],
    ['Mariama', 'Jalloh'],
    ['Abdul', 'Sillah'],
    ['Kadiatu', 'Sankoh'],
    ['Sahr', 'Fofanah'],
    ['Adama', 'Bah']
]

function demoCandidates(): PromotionCandidate[] {
    return demoNames.map(([givenNames, familyName], i) => ({
        studentId: `demo-${i}`,
        enrollmentId: `demo-enr-${i}`,
        name: `${givenNames} ${familyName}`,
        admissionNumber: `SKT-${(1000 + i).toString()}`,
        outcome: 'PROMOTE' as PromotionOutcome,
        targetClassId: null,
        targetClassName: null
    }))
}

export const usePromotionStore = defineStore('promotion', {
    state: () => ({
        candidates: [] as PromotionCandidate[],
        batches: [...seedBatches] as PromotionBatch[],
        loadingCandidates: false,
        usingDemoData: false
    }),

    actions: {
        async loadCandidates(classId: string) {
            this.loadingCandidates = true
            this.candidates = []
            this.usingDemoData = false

            try {
                const res = await useStudentStore().getAllEnrollmentByClass(classId) as any
                const records = (res?.records || []) as Student[]

                if (records.length) {
                    this.candidates = records.map(s => ({
                        studentId: s.id,
                        enrollmentId: s.enrollmentId,
                        name: `${s.givenNames} ${s.familyName}`,
                        admissionNumber: s.admissionNumber,
                        outcome: 'PROMOTE' as PromotionOutcome,
                        targetClassId: null,
                        targetClassName: null
                    }))
                } else {
                    this.candidates = demoCandidates()
                    this.usingDemoData = true
                }
            } catch {
                this.candidates = demoCandidates()
                this.usingDemoData = true
            } finally {
                this.loadingCandidates = false
            }
        },

        setOutcome(studentId: string, outcome: PromotionOutcome) {
            const candidate = this.candidates.find(e => e.studentId === studentId)
            if (candidate) candidate.outcome = outcome
        },

        setTarget(studentId: string, classId: string) {
            const candidate = this.candidates.find(e => e.studentId === studentId)
            if (!candidate) return

            candidate.targetClassId = classId
            candidate.targetClassName = useClassSessionStore().get(classId)
                ? `${useClassSessionStore().get(classId)?.clazz} (${useClassSessionStore().get(classId)?.sectionName})`
                : null
        },

        applyBulkTarget(classId: string) {
            this.candidates
                .filter(e => e.outcome === 'PROMOTE')
                .forEach(e => { this.setTarget(e.studentId, classId) })
        },

        confirmPromotion(fromClassId: string, fromClassName: string, toClassName: string) {
            if (!this.candidates.length) throw new Error('No students to promote')

            const promoted = this.candidates.filter(e => e.outcome === 'PROMOTE')
            if (promoted.some(e => !e.targetClassId)) {
                throw new Error('Select a target class for every student being promoted')
            }

            const batch: PromotionBatch = {
                id: uid(),
                fromClassId,
                fromClassName,
                toClassName,
                promotedCount: promoted.length,
                repeatedCount: this.candidates.filter(e => e.outcome === 'REPEAT').length,
                graduatedCount: this.candidates.filter(e => e.outcome === 'GRADUATE').length,
                totalCount: this.candidates.length,
                performedBy: 'You',
                performedAt: new Date().toISOString(),
                students: this.candidates.map(c => ({ ...c })),
                isDemo: this.usingDemoData
            }

            this.batches.unshift(batch)
            this.candidates = []
            return batch
        }
    }
})
