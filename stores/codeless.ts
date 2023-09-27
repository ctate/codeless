import axios from 'axios'
import { ChatCompletionRole } from 'openai/resources/chat/index.mjs'
import { StateCreator, create } from 'zustand'

type AppState = CodelessState

type Mode = '' | 'local' | 'demo'
type Model = 'gpt-3.5-turbo' | 'gpt-4'
type Version = {
  code: string
  messages: Array<{
    content: string
    role: ChatCompletionRole
  }>
}

export interface CodelessState {
  code: string
  setCode: (code: string) => void

  dialogType: '' | 'user' | 'star'
  setDialogType: (dialogType: '' | 'user' | 'star') => void

  hasApiKey: boolean
  setHasApiKey: (hasApiKey: boolean) => void

  history: number[]
  setHistory: (history: number[]) => void

  id: string
  setId: (id: string) => void

  isInitialized: boolean
  setIsInitialized: (isInitialized: boolean) => void

  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void

  mode: Mode
  setMode: (mode: Mode) => void

  model: Model
  setModel: (model: Model) => void

  provider: 'openai'
  setProvider: (provider: 'openai') => void

  numberOfSteps: number
  setNumberOfSteps: (numberOfSteps: number) => void

  showCode: boolean
  setShowCode: (showCode: boolean) => void

  showComponents: boolean
  setShowComponents: (showComponents: boolean) => void

  step: number
  setStep: (step: number) => void

  text: string
  setText: (text: string) => void

  versions: Version[]
  setVersions: (versions: Version[]) => void

  init: () => Promise<void>
  load: (id: string) => Promise<void>

  reset: () => void
}

export const createCodelessSlice: StateCreator<CodelessState> = (set) => ({
  code: '',
  setCode: (code) => set(() => ({ code })),

  dialogType: '',
  setDialogType: (dialogType) => set(() => ({ dialogType })),

  hasApiKey: false,
  setHasApiKey: (hasApiKey) => set(() => ({ hasApiKey })),

  history: [],
  setHistory: (history) => set(() => ({ history })),

  id: '',
  setId: (id) => set(() => ({ id })),

  isInitialized: false,
  setIsInitialized: (isInitialized) => set(() => ({ isInitialized })),

  isLoading: false,
  setIsLoading: (isLoading) => set(() => ({ isLoading })),

  mode: '',
  setMode: (mode) => set(() => ({ mode })),

  model: 'gpt-3.5-turbo',
  setModel: (model) => set(() => ({ model })),

  numberOfSteps: 0,
  setNumberOfSteps: (numberOfSteps) => set(() => ({ numberOfSteps })),

  provider: 'openai',
  setProvider: (provider) => set(() => ({ provider })),

  showCode: false,
  setShowCode: (showCode) => set(() => ({ showCode })),

  showComponents: false,
  setShowComponents: (showComponents) => set(() => ({ showComponents })),

  step: 0,
  setStep: (step) => set(() => ({ step })),

  text: '',
  setText: (text) => set(() => ({ text })),

  versions: [],
  setVersions: (versions) => set(() => ({ versions })),

  init: async () => {
    set({
      id: '',
    })

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

  load: async (id: string) => {
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

    const codeRes = await axios({
      method: 'POST',
      url: '/api/code/getCode',
      data: {
        id: `code/${id}`,
      },
    })
    const codeData = codeRes.data as {
      id: string
      currentStep: number
      history: number[]
      latestStep: -1
      user: string
      versions: Array<{
        code: string
        messages: Array<{
          content: string
          role: ChatCompletionRole
        }>
      }>
    }

    set({
      code: codeData.versions[codeData.history[codeData.currentStep]].code,
      isInitialized: true,
      hasApiKey: hasApiKeyRes.data.hasApiKey,
      history: codeData.history,
      id: codeData.id,
      mode: modeRes.data.mode || 'local',
      model: settingsRes.data.value || 'gpt-3.5-turbo',
      numberOfSteps: codeData.history.length,
      step: codeData.currentStep,
      versions: codeData.versions,
    })
  },

  reset: () => {
    set({ mode: '' })
  },
})

export const useCodelessStore = create<AppState>()((...args) => ({
  ...createCodelessSlice(...args),
}))
