import { ProofState } from "./rpc_api"
import { Diagnostic } from 'vscode-languageserver-types'
import { RpcSessionAtPos } from '@leanprover/infoview-api'
import { loadGoals } from '.infoview/goals'

export interface ProofStateManager {
  // Core state
  proof: ProofState               // Current proof state
  interimDiags: Diagnostic[]      // In-progress diagnostics
  crashed: boolean                // Server crash state
  selectedStep?: number           // Currently selected step

  // Game state integration
  completed: boolean              // Level completion status
  inventory: string[]             // Available tactics/theorems

  // Methods
  updateProof: (newProof: ProofState) => void
  deleteFromStep: (stepNumber: number) => void
  loadProofState: () => Promise<void>   // Load from server
  selectStep: (step?: number) => void

}
