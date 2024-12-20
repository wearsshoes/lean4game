import { ProofState } from "./infoview/rpc_api"
import { Diagnostic } from 'vscode-languageserver-types'
import { RpcSessionAtPos } from '@leanprover/infoview-api'
import { loadGoals } from './infoview/goals'

import * as React from 'react'

export interface ProofStateManager {
  proof: ProofState
  interimDiags: Diagnostic[]
  crashed: boolean
  selectedStep?: number
  rpcSess?: RpcSessionAtPos
  uri?: string

  updateProof: (newProof: ProofState) => void
  deleteFromStep: (stepNumber: number) => void
  loadProofState: () => Promise<void>
  selectStep: (step?: number) => void
  setSession: (rpcSess: RpcSessionAtPos, uri: string) => void
}

export const useProofState = (): ProofStateManager => {
  const [proof, setProof] = React.useState<ProofState>({
    steps: [],
    diagnostics: [],
    completed: false,
    completedWithWarnings: false
  })
  const [interimDiags, setInterimDiags] = React.useState<Array<Diagnostic>>([])
  const [crashed, setCrashed] = React.useState<boolean>(false)
  const [selectedStep, setSelectedStep] = React.useState<number>()
  const [rpcSess, setRpcSess] = React.useState<RpcSessionAtPos>()
  const [uri, setUri] = React.useState<string>()

  const setSession = (newRpcSess: RpcSessionAtPos, newUri: string) => {
    setRpcSess(newRpcSess)
    setUri(newUri)
  }

  const loadProofState = async () => {
    if (!rpcSess || !uri) {
      console.warn('Attempted to load proof state before session was initialized')
      return
    }
    await loadGoals(rpcSess, uri, setProof, setCrashed)
  }

  return {
    proof,
    interimDiags,
    crashed,
    selectedStep,
    rpcSess,
    uri,
    updateProof: setProof,
    deleteFromStep: () => {}, // TODO: Implement
    loadProofState,
    selectStep: setSelectedStep,
    setSession
  }
}

export const ProofStateContext = React.createContext<ProofStateManager>(null)

export const ProofStateProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const proofState = useProofState()
  return (
    <ProofStateContext.Provider value={proofState}>
      {children}
    </ProofStateContext.Provider>
  )
}
