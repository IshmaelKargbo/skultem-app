import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    title: ''
  }),

  actions: {
    setTitle(newTitle: string) {
      this.title = newTitle
    }
  }
})
