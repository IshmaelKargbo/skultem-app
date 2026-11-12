// The M-Compose design a school prints each kind of document with (/document-designs). See DocumentDesignService.
export type DocumentDesignKind = 'report-card' | 'exam-result-slip' | 'exam-statement'

export type DocumentDesignOption = {
  ref: string, name: string, description: string, category: string, readyMade: boolean, hasPreview: boolean,
  suggested: boolean,
  // How many data fields the design has, and the ones Skultem doesn't fill (they print blank); null = unknown.
  fields: number | null, missing: string[] | null
}

export type DocumentDesignChoice = {
  kind: DocumentDesignKind, current: string, serverDefault: string, chosenBySchool: boolean,
  options: DocumentDesignOption[]
}

// Linking a design's placeholders to Skultem's data (see DocumentFieldLinkService).
export type DataSource = {
  key: string, label: string, group: string, type: 'TEXT' | 'IMAGE' | 'LIST', example: string, columns: DataSource[]
}
// A placeholder's link: a Skultem data key ('' = leave blank), or fixed text; a list's columns map to a row key,
// 'text:...' or ''.
export type FieldLink = { source?: string | null, text?: string | null, columns?: Record<string, string> | null }
export type DesignPlaceholder = {
  name: string, type: 'TEXT' | 'IMAGE' | 'LIST', columns: string[], link: FieldLink | null,
  automatic: string | null,
  // For a list: by each Skultem list it could take rows from, the row field that fills each column on its own.
  automaticColumns: Record<string, Record<string, string>>
}
// choice: true show, false hide, null automatic. follows: the report card setting it follows when automatic.
export type DesignGroupChoice = {
  id: string, name: string, designShows: boolean, field: string, choice: boolean | null,
  follows: string | null, followsLabel: string | null
}

export type FieldLinkEditor = {
  kind: DocumentDesignKind, template: string, templateName: string, readyMade: boolean,
  placeholders: DesignPlaceholder[], sources: DataSource[], saved: boolean,
  // The design's groups (elements shown or hidden together) and the school's choice for each.
  groups: DesignGroupChoice[],
  // The level these links are for (null = all levels); inherited = the level uses the all-levels links for now.
  level: string | null, inherited: boolean
}

// Pictures of ready-made designs, kept for the visit (they don't change between deploys of the engine).
const previews = new Map<string, Promise<string | null>>()

export const DocumentDesignApi = () => {
  const { $api } = useNuxtApp()

  return {
    choice: async (kind: DocumentDesignKind, all = false): Promise<DocumentDesignChoice> => {
      try {
        const res = await $api(`/document-designs/${kind}?all=${all}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
        throw err
      }
    },

    // template empty = back to the default design.
    choose: async (kind: DocumentDesignKind, template: string | null): Promise<DocumentDesignChoice> => {
      try {
        const res = await $api(`/document-designs/${kind}`, { method: 'PUT', body: { template } }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
        throw err
      }
    },

    // One exam's own design (NPSE, BECE...) for its slip or statement; chosenBySchool = it has its own, and
    // serverDefault is the school's general exam design it otherwise uses. template empty = use the general one.
    // One level's own design (a Primary report card); serverDefault is the school's general design it otherwise uses.
    levelChoice: async (level: string, kind: DocumentDesignKind, all = false): Promise<DocumentDesignChoice> => {
      try {
        const res = await $api(`/document-designs/${kind}/levels/${level}?all=${all}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
        throw err
      }
    },

    levelChoose: async (level: string, kind: DocumentDesignKind, template: string | null): Promise<DocumentDesignChoice> => {
      try {
        const res = await $api(`/document-designs/${kind}/levels/${level}`, { method: 'PUT', body: { template } }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
        throw err
      }
    },

    examChoice: async (examId: string, kind: DocumentDesignKind, all = false): Promise<DocumentDesignChoice> => {
      try {
        const res = await $api(`/external-exams/exams/${examId}/designs/${kind}?all=${all}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
        throw err
      }
    },

    examChoose: async (examId: string, kind: DocumentDesignKind, template: string | null): Promise<DocumentDesignChoice> => {
      try {
        const res = await $api(`/external-exams/exams/${examId}/designs/${kind}`, { method: 'PUT', body: { template } }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
        throw err
      }
    },

    // A design's placeholders, their links and every piece of data Skultem has (template empty = the current design).
    fields: async (kind: DocumentDesignKind, template?: string | null, level?: string | null): Promise<FieldLinkEditor> => {
      try {
        const q = new URLSearchParams()
        if (template) q.set('template', template)
        if (level) q.set('level', level)
        const res = await $api(`/document-designs/${kind}/fields${q.toString() ? `?${q}` : ''}`) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
        throw err
      }
    },

    saveFields: async (kind: DocumentDesignKind, template: string, links: Record<string, FieldLink>,
      groups: Record<string, boolean> = {}, level: string | null = null): Promise<FieldLinkEditor> => {
      try {
        const res = await $api(`/document-designs/${kind}/fields`, { method: 'PUT', body: { template, links, groups, level } }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
        throw err
      }
    },

    // The level goes back to the all-levels links for this design.
    useAllLevels: async (kind: DocumentDesignKind, template: string, level: string): Promise<FieldLinkEditor> => {
      try {
        const res = await $api(`/document-designs/${kind}/fields?template=${encodeURIComponent(template)}&level=${level}`,
          { method: 'DELETE' }) as any
        return res.data
      } catch (err: any) {
        useHandleError(err)
        throw err
      }
    },

    // A ready-made design's picture as an object URL, or null.
    preview: (ref: string): Promise<string | null> => {
      const id = ref.startsWith('sample:') ? ref.slice('sample:'.length) : ref
      if (!previews.has(id)) {
        const { accessToken } = useAuthCookies()
        previews.set(id, fetch(`${apiBaseUrl()}/document-designs/preview/${encodeURIComponent(id)}`, {
          headers: accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}
        }).then(async res => (res.ok ? URL.createObjectURL(await res.blob()) : null)).catch(() => null))
      }
      return previews.get(id)!
    }
  }
}
