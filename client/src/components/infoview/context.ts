/**
 *  @fileOverview This file contains the the react contexts used in the project.
 */
import * as React from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import { InteractiveDiagnostic } from '@leanprover/infoview-api';
import { Diagnostic } from 'vscode-languageserver-types'
import { GameHint, InteractiveGoal, InteractiveTermGoal,InteractiveGoalsWithHints, ProofState } from './rpc_api';
import { PreferencesState } from '../../state/preferences';

export const MonacoEditorContext = React.createContext<monaco.editor.IStandaloneCodeEditor>(
  null as any)

export type InfoStatus = 'updating' | 'error' | 'ready';

// /** One step of the proof */
// export type ProofStep = {
//   /** The command in this step */
//   command : string
//   /** List of goals *after* this command */
//   goals: InteractiveGoal[]     // TODO: Add correct type
//   /** Story relevant messages */
//   hints: GameHint[]        // TODO: Add correct type
//   /** Errors and warnings */
//   errors: InteractiveDiagnostic[]       // TODO: Add correct type
// }

/** The context storing the proof step-by-step for the command line mode */
export const ProofContext = React.createContext<{
  /** The proof consists of multiple steps that are processed one after the other.
   * In particular multi-line terms like `match`-statements will not be supported.
   *
   * Note that the first step will always have "" as command
   */
  proof: ProofState,
  setProof: React.Dispatch<React.SetStateAction<ProofState>>
  /** TODO: Workaround to capture a crash of the gameserver. */
  interimDiags: Diagnostic[],
  setInterimDiags: React.Dispatch<React.SetStateAction<Array<Diagnostic>>>
  /** TODO: Workaround to capture a crash of the gameserver. */
  crashed: Boolean,
  setCrashed: React.Dispatch<React.SetStateAction<Boolean>>
}>({
  proof: {steps: [], diagnostics: [], completed: false, completedWithWarnings: false},
  setProof: () => {},
  interimDiags: [],
  setInterimDiags: () => {},
  crashed: false,
  setCrashed: () => {}
})


// TODO: Do we still need that?
export interface ProofStateProps {
  // pos: DocumentPosition;
  status: InfoStatus;
  messages: InteractiveDiagnostic[];
  goals?: InteractiveGoalsWithHints;
  termGoal?: InteractiveTermGoal;
  error?: string;
  // userWidgets: UserWidgetInstance[];
  // rpcSess: RpcSessionAtPos;
  // triggerUpdate: () => Promise<void>;
}

// export const ProofStateContext = React.createContext<{
//   proofState : ProofStateProps,
//   setProofState: React.Dispatch<React.SetStateAction<ProofStateProps>>
// }>({
//   proofState : {
//     status: 'updating',
//     messages: [],
//     goals: undefined,
//     termGoal: undefined,
//     error: undefined},
//   setProofState: () => {},
// })

export interface IPreferencesContext extends PreferencesState{
  mobile: boolean, // The variables that actually control the page 'layout' can only be changed through layout.
  setLayout: React.Dispatch<React.SetStateAction<PreferencesState["layout"]>>;
  setIsSavePreferences: React.Dispatch<React.SetStateAction<PreferencesState["isSavePreferences"]>>;
  setLanguage: React.Dispatch<React.SetStateAction<PreferencesState["language"]>>;
}

export const PreferencesContext = React.createContext<IPreferencesContext>({
  mobile: false,
  layout: "auto",
  isSavePreferences: false,
  language: "en",
  setLayout: () => {},
  setIsSavePreferences: () => {},
  setLanguage: () => {},
})

export const WorldLevelIdContext = React.createContext<{
  worldId : string,
  levelId: number
}>({
  worldId : null,
  levelId: 0,
})

/** Context to keep highlight selected proof step and corresponding chat messages. */
export const SelectionContext = React.createContext<{
  selectedStep : number,
  setSelectedStep: React.Dispatch<React.SetStateAction<number>>
}>({
  selectedStep : undefined,
  setSelectedStep: () => {}
})

/** Context for deleted Hints that are visible just a bit after they've been deleted */
export const DeletedChatContext = React.createContext<{
  deletedChat : GameHint[],
  setDeletedChat: React.Dispatch<React.SetStateAction<Array<GameHint>>>
  showHelp : Set<number>,
  setShowHelp: React.Dispatch<React.SetStateAction<Set<number>>>
}>({
  deletedChat: undefined,
  setDeletedChat: () => {},
  showHelp: undefined,
  setShowHelp: () => {}
})

export type inputModeType = 'typewriter' | 'dragDrop' | 'editor'

export const InputModeContext = React.createContext<{
  inputMode: inputModeType,
  setInputMode: React.Dispatch<React.SetStateAction<inputModeType>>,
  typewriterInput: string,
  setTypewriterInput: React.Dispatch<React.SetStateAction<string>>,
  lockEditorMode: boolean,
  setLockEditorMode: React.Dispatch<React.SetStateAction<boolean>>,
}>({
  inputMode: 'typewriter',
  setInputMode: () => {},
  typewriterInput: "",
  setTypewriterInput: () => {},
  lockEditorMode: false,
  setLockEditorMode: () => {},
});
