/**
 *  @fileOverview This file contains the the react contexts used in the project.
 */
import * as React from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import { GameHint } from './rpc_api';
import { PreferencesState } from '../../state/preferences';
import { Icons } from '../../icons/icons';
import { InteractiveDiagnostic, InteractiveTermGoal, UserWidgetInstance } from '@leanprover/infoview/*';
import { InteractiveGoalsWithHints } from './rpc_api';
export const MonacoEditorContext = React.createContext<monaco.editor.IStandaloneCodeEditor>(
  null as any)

export type InfoStatus = 'updating' | 'error' | 'ready';

export interface ProofStateProps {
  status: InfoStatus;
  messages: InteractiveDiagnostic[];
  goals?: InteractiveGoalsWithHints;
  termGoal?: InteractiveTermGoal;
  error?: string;
  userWidgets: UserWidgetInstance[];
}

export interface IPreferencesContext extends PreferencesState {
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
  setLayout: () => { },
  setIsSavePreferences: () => { },
  setLanguage: () => { },
})

export const WorldLevelIdContext = React.createContext<{
  worldId: string,
  levelId: number
}>({
  worldId: null,
  levelId: 0,
})

/** Context to keep highlight selected proof step and corresponding chat messages. */
export const SelectionContext = React.createContext<{
  selectedStep: number,
  setSelectedStep: React.Dispatch<React.SetStateAction<number>>
}>({
  selectedStep: undefined,
  setSelectedStep: () => { }
})

/** Context for deleted Hints that are visible just a bit after they've been deleted */
export const DeletedChatContext = React.createContext<{
  deletedChat: GameHint[],
  setDeletedChat: React.Dispatch<React.SetStateAction<Array<GameHint>>>
  showHelp: Set<number>,
  setShowHelp: React.Dispatch<React.SetStateAction<Set<number>>>
}>({
  deletedChat: undefined,
  setDeletedChat: () => { },
  showHelp: undefined,
  setShowHelp: () => { }
})

export type UIMode = 'typewriter' | 'codeEditor' // | 'dragDrop'

export const InputModeContext = React.createContext<{
  uiMode: UIMode,
  setUIMode: React.Dispatch<React.SetStateAction<UIMode>>,
  typewriterInput: string,
  setTypewriterInput: React.Dispatch<React.SetStateAction<string>>,
  lockUIMode: boolean,
  setLockUIMode: React.Dispatch<React.SetStateAction<boolean>>,
  uiModeCases: Record<UIMode, { icon: any, labelText: string }>,
}>({
  uiMode: 'typewriter',
  setUIMode: () => { },
  typewriterInput: "",
  setTypewriterInput: () => { },
  lockUIMode: false,
  setLockUIMode: () => { },
  uiModeCases: {
    codeEditor: {
      icon: Icons.codeEditor,
      labelText: "Code Editor mode"
    },
    typewriter: {
      icon: Icons.typewriter,
      labelText: "Typewriter mode"
    },
    // dragDrop: {
    //   icon: Icons.dragDrop,
    //   labelText: "Drag & Drop mode"
    // }
  }
});
