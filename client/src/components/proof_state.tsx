import { InteractiveGoals, InteractiveTermGoal, ProofState } from "./infoview/rpc_api"
import { Diagnostic } from 'vscode-languageserver-types'
import { RpcSessionAtPos } from '@leanprover/infoview-api'
import { RpcService } from './infoview/rpc_service'
import { InfoStatus } from "./infoview/context"
import { InteractiveDiagnostic } from "@leanprover/infoview/*"

import * as React from 'react'
import { DocumentPosition, MsgEmbed, TaggedText } from "@leanprover/infoview/dist/infoview/util"
import { UserWidgetInstance } from "@leanprover/infoview/*"

export interface ProofStateManager {
  proof: ProofState
  interimDiags: Diagnostic[]
  crashed: boolean
  initializing: boolean
  selectedStep?: number
  rpcSess?: RpcSessionAtPos
  uri?: string
  rpcService?: RpcService
  status: InfoStatus
  messages: InteractiveDiagnostic[]
  error?: string
  termGoal?: InteractiveTermGoal
  userWidgets: UserWidgetInstance[]

  updateProof: (newProof: ProofState) => void
  updateInterimDiags: (newDiags: Diagnostic[]) => void
  updateStatus: (newStatus: InfoStatus) => void
  updateMessages: (newMessages: InteractiveDiagnostic[]) => void
  updateError: (newError: string | undefined) => void
  updateTermGoal: (newTermGoal: InteractiveTermGoal) => void
  updateUserWidgets: (newWidgets: UserWidgetInstance[]) => void
  deleteFromStep: (stepNumber: number) => void
  loadProofState: () => Promise<void>
  selectStep: (step?: number) => void
  setSession: (rpcSess: RpcSessionAtPos, uri: string) => void
  setCrashed: (crashed: boolean) => void
  getGoals: (pos: DocumentPosition) => Promise<InteractiveGoals>
  getTermGoal: (pos: DocumentPosition) => Promise<InteractiveTermGoal>
  getWidgets: (pos: DocumentPosition) => Promise<{ widgets: UserWidgetInstance[] }>
  getDiagnostics: (startLine: number, endLine: number) => Promise<Diagnostic[]>

}

export const useProofState = (): ProofStateManager => {
  // State management
  const [proof, setProof] = React.useState<ProofState>({
    steps: [],
    diagnostics: [],
    completed: false,
    completedWithWarnings: false
  })
  const [interimDiags, setInterimDiags] = React.useState<Array<Diagnostic>>([])
  const [crashed, setCrashed] = React.useState<boolean>(false)
  const [initializing, setInitializing] = React.useState<boolean>(true)
  const [selectedStep, setSelectedStep] = React.useState<number>()
  const [rpcSess, setRpcSess] = React.useState<RpcSessionAtPos | null>(null)
  const [uri, setUri] = React.useState<string | null>(null)
  const [rpcService, setRpcService] = React.useState<RpcService | null>(null)
  const rpcServiceRef = React.useRef<RpcService | null>(null)
  const [status, setStatus] = React.useState<InfoStatus>('updating')
  const [messages, setMessages] = React.useState<InteractiveDiagnostic[]>([])
  const [error, setError] = React.useState<string>()
  const [termGoal, setTermGoal] = React.useState<InteractiveTermGoal>()
  const [userWidgets, setUserWidgets] = React.useState<UserWidgetInstance[]>([])

  // Callbacks
  const updateInterimDiags = React.useCallback((newDiags: Diagnostic[]) => {
    setInterimDiags(newDiags)
  }, [])

  const updateStatus = React.useCallback((newStatus: InfoStatus) => {
    setStatus(newStatus)
  }, [])

  const updateMessages = React.useCallback((newMessages: InteractiveDiagnostic[]) => {
    setMessages(newMessages)
  }, [])

  const updateError = React.useCallback((newError: string | undefined) => {
    setError(newError)
  }, [])

  const setSession = React.useCallback((newRpcSess: RpcSessionAtPos, newUri: string) => {
    if (!newRpcSess || !newUri) {
      console.debug('Attempted to set session with invalid parameters')
      return
    }

    // Reset crash state when setting up new session
    setCrashed(false)
    setInitializing(true)
    setRpcSess(newRpcSess)
    setUri(newUri)

    try {
      const newService = new RpcService(newRpcSess, newUri)
      setRpcService(newService)
      rpcServiceRef.current = newService
      // Keep initializing true until first successful proof state load
    } catch (error) {
      console.error('Failed to initialize RPC service:', error)
      setCrashed(true)
      setInitializing(false)
    }
  }, [])

  // Only set initializing to false after first successful proof state load
  const loadProofState = React.useCallback(async () => {
    if (!rpcServiceRef.current) {
      console.debug('Attempted to load proof state before RPC service was initialized')
      return
    }
    try {
      const newProof = await rpcServiceRef.current.getProofState()
      if (newProof) {
        setProof(newProof)
        setCrashed(false)
        setInitializing(false)  // Successfully loaded proof state
        console.log('Loaded proof state:', newProof)
      }
    } catch (error) {
      if (error === "Client is not running") {
        console.warn('(Spurious) Warning:', error)
        // Do not set crashed to true for this specific error
      } else {
        console.error('Failed to load proof state:', error)
        setCrashed(true)
        setInitializing(false)
      }
    }
  }, [])

  // Delegate other RPC calls directly to service
  const getGoals = React.useCallback(async (pos: DocumentPosition) => {
    if (!rpcServiceRef.current) throw new Error('RPC service not initialized')
    return rpcServiceRef.current.getInteractiveGoals(pos)
  }, [])

  const getTermGoal = React.useCallback(async (pos: DocumentPosition) => {
    if (!rpcServiceRef.current) throw new Error('RPC service not initialized')
    return rpcServiceRef.current.getInteractiveTermGoal(pos)
  }, [])

  const getWidgets = React.useCallback(async (pos: DocumentPosition) => {
    if (!rpcServiceRef.current) throw new Error('RPC service not initialized')
    return rpcServiceRef.current.getWidgets(pos)
  }, [])

  const getDiagnostics = React.useCallback(async (startLine: number, endLine: number) => {
    if (!rpcServiceRef.current) throw new Error('RPC service not initialized')
    return rpcServiceRef.current.getDiagnostics(startLine, endLine)
  }, [])

  // Helper function to extract text from TaggedText<MsgEmbed>
  function extractTextFromTaggedText(taggedText: TaggedText<MsgEmbed>): string {
    if (typeof taggedText === 'string') {
      return taggedText
    } else if ('text' in taggedText) {
      return taggedText.text
    } else if ('append' in taggedText) {
      return taggedText.append.map(extractTextFromTaggedText).join('')
    }
    return ''
  }

  return {
    // State
    proof,
    interimDiags,
    crashed,
    initializing,
    selectedStep,
    rpcSess,
    uri,
    rpcService,
    status,
    messages,
    error,
    termGoal,
    userWidgets,

    // Updaters
    updateProof: setProof,
    updateInterimDiags,
    updateStatus,
    updateMessages,
    updateError,
    updateTermGoal: setTermGoal,
    updateUserWidgets: setUserWidgets,
    deleteFromStep: () => { }, // TODO: Implement
    loadProofState,
    selectStep: setSelectedStep,
    setSession,
    setCrashed,

    // RPC methods
    getGoals,
    getTermGoal,
    getWidgets,
    getDiagnostics
  }
}

export const ProofStateContext = React.createContext<ProofStateManager>(null)

export const ProofStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const proofState = useProofState()
  return (
    <ProofStateContext.Provider value={proofState}>
      {children}
    </ProofStateContext.Provider>
  )
}
