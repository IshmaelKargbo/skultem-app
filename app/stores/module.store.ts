import { defineStore } from 'pinia'

export const useModuleStore = defineStore('module', {
  state: () => ({
    modules: [] as SchoolModule[],
    loaded: false,
    loading: false
  }),

  getters: {
    isInstalled: (state) => (key: string) => state.modules.find(m => m.key === key)?.installed ?? false,
    byCategory: (state) => {
      const groups: { category: string, label: string, modules: SchoolModule[] }[] = []
      for (const module of state.modules) {
        let group = groups.find(g => g.category === module.category)
        if (!group) {
          group = { category: module.category, label: module.categoryLabel, modules: [] }
          groups.push(group)
        }
        group.modules.push(module)
      }
      return groups
    }
  },

  actions: {
    async fetch() {
      this.loading = true
      try {
        const response = await ModuleApi().list()
        if (response) {
          this.modules = response
          this.loaded = true
        }
      } finally {
        this.loading = false
      }
    },
    async install(key: string) {
      const response = await ModuleApi().install(key)
      if (response) this.modules = response
      return response
    },
    async disable(key: string) {
      const response = await ModuleApi().disable(key)
      if (response) this.modules = response
      return response
    },
    reset() {
      this.modules = []
      this.loaded = false
    }
  }
})
