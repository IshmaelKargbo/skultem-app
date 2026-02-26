import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    title: 'Dashboard'
  }),

  actions: {
    setTitle(newTitle: string) {
      this.title = newTitle
    }
  }
})
