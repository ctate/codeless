import axios from 'axios'
import { StateCreator, create } from 'zustand'

type AppState = CodelessState

type Mode = '' | 'local' | 'demo'
type Model = 'gpt-3.5-turbo' | 'gpt-4'

export interface CodelessState {
  isInitialized: boolean
  setIsInitialized: (isInitialized: boolean) => void

  hasApiKey: boolean
  setHasApiKey: (hasApiKey: boolean) => void

  mode: Mode
  setMode: (mode: Mode) => void

  model: Model
  setModel: (model: Model) => void

  init: () => Promise<void>

  reset: () => void
}

export const createCodelessSlice: StateCreator<CodelessState> = (set) => ({
  isInitialized: false,
  setIsInitialized: (isInitialized) => set(() => ({ isInitialized })),

  hasApiKey: false,
  setHasApiKey: (hasApiKey) => set(() => ({ hasApiKey })),

  mode: '',
  setMode: (mode) => set(() => ({ mode })),

  model: 'gpt-3.5-turbo',
  setModel: (model) => set(() => ({ model })),

  init: async () => {
    const hasApiKeyRes = await axios({
      method: 'POST',
      url: '/api/chat/hasApiKey',
    })

    const modeRes = await axios({
      method: 'POST',
      url: '/api/mode/getMode',
    })

    const settingsRes = await axios({
      method: 'POST',
      url: '/api/settings/getValue',
      data: {
        key: 'model',
      },
    })

    set({
      isInitialized: true,
      hasApiKey: hasApiKeyRes.data.hasApiKey,
      mode: modeRes.data.mode || 'local',
      model: settingsRes.data.value || 'gpt-3.5-turbo',
    })
  },

  reset: () => {
    set({ mode: '' })
  },
})

export const useCodelessStore = create<AppState>()((...args) => ({
  ...createCodelessSlice(...args),
}))
