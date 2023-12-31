import axios from 'axios'
import { ChatCompletionRole } from 'openai/resources/chat/index.mjs'
import { StateCreator, create } from 'zustand'

type AppState = CodelessState

interface ForkedProject {
  id: number
  name: string
  slug: string
}
type Mode = '' | 'local' | 'demo'
type Model = 'gpt-3.5-turbo' | 'gpt-4'
type Version = {
  code: string
  imageUrl: string
  messages: Array<{
    content: string
    role: ChatCompletionRole
  }>
  number: number
  prompt: string
}
type User = {
  imageUrl: string
  username: string
}

export interface CodelessState {
  code: string
  setCode: (code: string) => void

  dialogType: '' | 'user' | 'star'
  setDialogType: (dialogType: '' | 'user' | 'star') => void

  forkedProject?: ForkedProject
  setForkedProject: (forkedProject?: ForkedProject) => void

  hasApiKey: boolean
  setHasApiKey: (hasApiKey: boolean) => void

  history: number[]
  setHistory: (history: number[]) => void

  id: number
  setId: (id: number) => void

  isInitialized: boolean
  setIsInitialized: (isInitialized: boolean) => void

  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void

  isSaving: boolean
  setIsSaving: (isSaving: boolean) => void

  isStarred: boolean
  setIsStarred: (isStarred: boolean) => void

  mode: Mode
  setMode: (mode: Mode) => void

  model: Model
  setModel: (model: Model) => void

  name: string
  setName: (name: string) => void

  provider: 'openai'
  setProvider: (provider: 'openai') => void

  numberOfSteps: number
  setNumberOfSteps: (numberOfSteps: number) => void

  showCode: boolean
  setShowCode: (showCode: boolean) => void

  showComponents: boolean
  setShowComponents: (showComponents: boolean) => void

  slug: string
  setSlug: (slug: string) => void

  snippet: string
  setSnippet: (snippet: string) => void

  snippetOutput: string
  setSnippetOutput: (snippetOutput: string) => void

  snippetIsEnabled: boolean
  setSnippetIsEnabled: (snippetIsEnabled: boolean) => void

  starCount: number
  setStarCount: (starCount: number) => void

  step: number
  setStep: (step: number) => void

  text: string
  setText: (text: string) => void

  user: User
  setUser: (user: User) => void

  versions: Version[]
  setVersions: (versions: Version[]) => void

  init: () => Promise<void>
  load: (slug: string) => Promise<void>

  reset: () => void
}

export const createCodelessSlice: StateCreator<CodelessState> = (set) => ({
  code: '',
  setCode: (code) => set(() => ({ code })),

  dialogType: '',
  setDialogType: (dialogType) => set(() => ({ dialogType })),

  forkedProject: undefined,
  setForkedProject: (forkedProject) => set(() => ({ forkedProject })),

  hasApiKey: false,
  setHasApiKey: (hasApiKey) => set(() => ({ hasApiKey })),

  history: [],
  setHistory: (history) => set(() => ({ history })),

  id: 0,
  setId: (id) => set(() => ({ id })),

  isInitialized: false,
  setIsInitialized: (isInitialized) => set(() => ({ isInitialized })),

  isLoading: false,
  setIsLoading: (isLoading) => set(() => ({ isLoading })),

  isSaving: false,
  setIsSaving: (isSaving) => set(() => ({ isSaving })),

  isStarred: false,
  setIsStarred: (isStarred) => set(() => ({ isStarred })),

  mode: '',
  setMode: (mode) => set(() => ({ mode })),

  model: 'gpt-3.5-turbo',
  setModel: (model) => set(() => ({ model })),

  name: '',
  setName: (name) => set(() => ({ name })),

  numberOfSteps: 0,
  setNumberOfSteps: (numberOfSteps) => set(() => ({ numberOfSteps })),

  provider: 'openai',
  setProvider: (provider) => set(() => ({ provider })),

  showCode: false,
  setShowCode: (showCode) => set(() => ({ showCode })),

  showComponents: false,
  setShowComponents: (showComponents) => set(() => ({ showComponents })),

  slug: '',
  setSlug: (slug) => set(() => ({ slug })),

  snippet: '',
  setSnippet: (snippet) => set(() => ({ snippet })),

  snippetOutput: '',
  setSnippetOutput: (snippetOutput) => set(() => ({ snippetOutput })),

  snippetIsEnabled: false,
  setSnippetIsEnabled: (snippetIsEnabled) => set(() => ({ snippetIsEnabled })),

  starCount: 0,
  setStarCount: (starCount) => set(() => ({ starCount })),

  step: 0,
  setStep: (step) => set(() => ({ step })),

  text: '',
  setText: (text) => set(() => ({ text })),

  user: {
    imageUrl: '',
    username: '',
  },
  setUser: (user) => set(() => ({ user })),

  versions: [],
  setVersions: (versions) => set(() => ({ versions })),

  init: async () => {
    set({
      id: 0,
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

  load: async (slug) => {
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
      url: '/api/project/getProject',
      data: {
        slug,
      },
    })
    const codeData = codeRes.data as {
      id: number
      currentStep: number
      forkedProject?: {
        id: number
        name: string
        slug: string
      }
      history: number[]
      isStarred: boolean
      latestStep: number
      name: string
      slug: string
      starCount: number
      user: {
        imageUrl: string
        username: string
      }
      versions: Array<{
        code: string
        imageUrl: string
        messages: Array<{
          content: string
          role: ChatCompletionRole
        }>
        number: number
        prompt: string
      }>
    }
    set({
      code: codeData.versions.find(
        (v) => v.number === codeData.history[codeData.currentStep]
      )?.code,
      isInitialized: true,
      forkedProject: codeData.forkedProject,
      hasApiKey: hasApiKeyRes.data.hasApiKey,
      history: codeData.history,
      id: codeData.id,
      isStarred: codeData.isStarred,
      mode: modeRes.data.mode || 'local',
      model: settingsRes.data.value || 'gpt-3.5-turbo',
      name: codeData.name,
      numberOfSteps: codeData.history.length,
      slug: codeData.slug,
      starCount: codeData.starCount,
      step: codeData.currentStep,
      user: codeData.user,
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
