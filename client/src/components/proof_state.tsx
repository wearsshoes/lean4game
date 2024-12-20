import { InteractiveGoals, InteractiveTermGoal, ProofState } from "./infoview/rpc_api"
import { Diagnostic } from 'vscode-languageserver-types'
import { RpcSessionAtPos } from '@leanprover/infoview-api'
import { RpcService } from './infoview/rpc_service'

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

  updateProof: (newProof: ProofState) => void
  updateInterimDiags: (newDiags: Diagnostic[]) => void
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
  // All state hooks must come first
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

  // All callbacks must come after state hooks
  const updateInterimDiags = React.useCallback((newDiags: Diagnostic[]) => {
    setInterimDiags(newDiags)
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
      }
    } catch (error) {
      console.error('Failed to load proof state:', error)
      setCrashed(true)
      setInitializing(false)
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
    const interactiveDiagnostics = await rpcServiceRef.current.getDiagnostics(startLine, endLine)

    // Map InteractiveDiagnostic to Diagnostic
    return interactiveDiagnostics.map(diag => ({
      ...diag,
      message: extractTextFromTaggedText(diag.message) // Convert TaggedText to string
    }))
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
    proof,
    interimDiags,
    crashed,
    initializing,
    selectedStep,
    rpcSess: rpcSess || undefined,
    uri: uri || undefined,
    rpcService: rpcService || undefined,
    updateProof: setProof,
    updateInterimDiags,
    deleteFromStep: () => { }, // TODO: Implement
    loadProofState,
    selectStep: setSelectedStep,
    setSession,
    setCrashed,
    getGoals,
    getTermGoal,
    getWidgets,
    getDiagnostics
  }
}

export const ProofStateContext = React.createContext<ProofStateManager>(null)

export const ProofStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const proofState = useProofState()

  // Provide initial empty state to avoid null reference errors
  const value = React.useMemo(() => ({
    ...proofState,
    proof: proofState.proof || {
      steps: [],
      diagnostics: [],
      completed: false,
      completedWithWarnings: false
    },
    rpcService: proofState.rpcService || null,
    rpcSess: proofState.rpcSess || null,
    uri: proofState.uri || null,
    interimDiags: proofState.interimDiags || [],
    crashed: proofState.crashed || false,
    selectedStep: proofState.selectedStep || undefined,
  }), [proofState])

  return (
    <ProofStateContext.Provider value={value}>
      {children}
    </ProofStateContext.Provider>
  )
}
