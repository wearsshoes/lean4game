import * as React from 'react'
import { useRef, useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import { Registry } from 'monaco-textmate' // peer dependency
import { wireTmGrammars } from 'monaco-editor-textmate'
import { PublishDiagnosticsParams, DocumentUri } from 'vscode-languageserver-protocol';
import { useServerNotificationEffect } from '../../../../node_modules/lean4-infoview/src/infoview/util';
import { AbbreviationRewriter } from 'lean4web/client/src/editor/abbreviation/rewriter/AbbreviationRewriter';
import { AbbreviationProvider } from 'lean4web/client/src/editor/abbreviation/AbbreviationProvider';
import * as leanSyntax from 'lean4web/client/src/syntaxes/lean.json'
import * as leanMarkdownSyntax from 'lean4web/client/src/syntaxes/lean-markdown.json'
import * as codeblockSyntax from 'lean4web/client/src/syntaxes/codeblock.json'
import languageConfig from 'lean4/language-configuration.json';
import { DeletedChatContext, InputModeContext, MonacoEditorContext } from './context'
import { lastStepHasErrors } from './goals'
import { useTranslation } from 'react-i18next'
import { ProofStateContext } from '../proof_state'


/* We register a new language `leancmd` that looks like lean4, but does not use the lsp server. */

// register Monaco languages
monaco.languages.register({
  id: 'lean4cmd',
  extensions: ['.leancmd']
})

// map of monaco "language id's" to TextMate scopeNames
const grammars = new Map()
grammars.set('lean4', 'source.lean')
grammars.set('lean4cmd', 'source.lean')

const registry = new Registry({
  getGrammarDefinition: async (scopeName) => {
    if (scopeName === 'source.lean') {
      return {
          format: 'json',
          content: JSON.stringify(leanSyntax)
      }
    } else if (scopeName === 'source.lean.markdown') {
      return {
          format: 'json',
          content: JSON.stringify(leanMarkdownSyntax)
      }
    } else {
      return {
          format: 'json',
          content: JSON.stringify(codeblockSyntax)
      }
    }
  }
});

wireTmGrammars(monaco, registry, grammars)

let config: any = { ...languageConfig }
config.autoClosingPairs = config.autoClosingPairs.map(
  pair => { return {'open': pair[0], 'close': pair[1]} }
)
monaco.languages.setLanguageConfiguration('lean4cmd', config);

/** The input field */
export function TypewriterInputField({disabled}: {disabled?: boolean}) {
  let { t } = useTranslation()

  /** Reference to the hidden multi-line editor */
  const editor = React.useContext(MonacoEditorContext)
  const model = editor.getModel()
  const uri = model.uri.toString()

  const [oneLineEditor, setOneLineEditor] = useState<monaco.editor.IStandaloneCodeEditor>(null)
  const [processing, setProcessing] = useState(false)

  const {typewriterInput, setTypewriterInput} = React.useContext(InputModeContext)
  const proofState = React.useContext(ProofStateContext)

  const inputRef = useRef()
  const { runCommand } = React.useContext(InputModeContext)


  const {proof, interimDiags, updateInterimDiags, setCrashed, loadProofState} = React.useContext(ProofStateContext)
  const {setDeletedChat} = React.useContext(DeletedChatContext)

  useEffect(() => {
    if (oneLineEditor && oneLineEditor.getValue() !== typewriterInput) {
      oneLineEditor.setValue(typewriterInput)
    }
  }, [typewriterInput])

  /* Load proof only when typewriter is first mounted */
  useEffect(() => {
    loadProofState()
  }, []) // Empty dependency array since we only want this on mount

  /** If the last step has an error, add the command to the typewriter. */
  useEffect(() => {
    if (lastStepHasErrors(proof)) {
      setTypewriterInput(proof?.steps[proof?.steps.length - 1].command)
    }
  }, [proof])

  // Reset processing state when diagnostics are published
  useServerNotificationEffect('textDocument/publishDiagnostics', (params: PublishDiagnosticsParams) => {
    if (params.uri == uri) {
      setProcessing(false)
      editor.setPosition(editor.getModel().getFullModelRange().getEndPosition())
    }
  }, [uri, editor]);

  useEffect(() => {
    const myEditor = monaco.editor.create(inputRef.current!, {
      value: typewriterInput,
      language: "lean4cmd",
      quickSuggestions: false,
      lightbulb: {
        enabled: true
      },
      unicodeHighlight: {
          ambiguousCharacters: false,
      },
      automaticLayout: true,
      minimap: {
        enabled: false
      },
      lineNumbers: 'off',
      tabSize: 2,
      glyphMargin: false,
      folding: false,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 0,
      'semanticHighlighting.enabled': true,
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      scrollbar: {
        vertical: 'hidden',
        horizontalScrollbarSize: 3
      },
      overviewRulerBorder: false,
      theme: 'vs-code-theme-converted',
      contextmenu: false
    })

    setOneLineEditor(myEditor)

    const abbrevRewriter = new AbbreviationRewriter(new AbbreviationProvider(), myEditor.getModel(), myEditor)

    return () => {abbrevRewriter.dispose(); myEditor.dispose()}
  }, [])

  useEffect(() => {
    if (!oneLineEditor) return
    // Ensure that our one-line editor can only have a single line
    const l = oneLineEditor.getModel().onDidChangeContent((e) => {
      const value = oneLineEditor.getValue()
      setTypewriterInput(value)
      const newValue = value.replace(/[\n\r]/g, '')
      if (value != newValue) {
        oneLineEditor.setValue(newValue)
      }
    })
    return () => { l.dispose() }
  }, [oneLineEditor, setTypewriterInput])

  useEffect(() => {
    if (!oneLineEditor) return
    // Run command when pressing enter
    const l = oneLineEditor.onKeyUp((ev) => {
      if (ev.code === "Enter") {
        runCommand()
      }
    })
    return () => { l.dispose() }
  }, [oneLineEditor, runCommand])



  /** Process the entered command */
  const handleSubmit : React.FormEventHandler<HTMLFormElement> = (ev) => {
    ev.preventDefault()
    runCommand()
  }

  // do not display if the proof is completed (with potential warnings still present)
  return <div className={`typewriter${proof?.completedWithWarnings ? ' hidden' : ''}`}>
      <form onSubmit={handleSubmit}>
        <div className="typewriter-input-wrapper">
          <div ref={inputRef} className="typewriter-input" />
        </div>
        <button type="submit" disabled={processing} className="btn btn-inverted">
          <FontAwesomeIcon icon={faWandMagicSparkles} />&nbsp;{t("Execute")}
        </button>
      </form>
    </div>
}