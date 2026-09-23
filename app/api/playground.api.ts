// The current school's own playground mode (see backend PlaygroundController). The flag itself is
// only ever set by a system admin - see SystemApi().setTestFlag.
export const PlaygroundApi = () => {
  const { $api } = useNuxtApp()

  return {
    getSummary: async () => {
      try {
        const res = await $api('/playground') as any

        if (!res)
          throw new Error('Failed to fetch playground summary')

        return res.data as PlaygroundSummary
      } catch (err: any) {
        useHandleError(err)
      }
    },
    goLive: async (payload: GoLivePayload) => {
      try {
        const res = await $api('/playground/go-live', { method: 'POST', body: payload }) as any

        if (!res)
          throw new Error('Failed to go live')

        return res.data
      } catch (err: any) {
        useHandleError(err)
      }
    }
  }
}
