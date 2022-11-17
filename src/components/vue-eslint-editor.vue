<template>
  <MonacoEditor
    ref="monacoEditor"
    v-model="editorValue"
    :right-code="fixedCode"
    :markers="markers"
    :right-markers="rightMarkers"
    :provide-code-actions="provideCodeActions"
    :diff-editor="previewFix"
    :language="language"
    @mounted-editor="initialize"
  >
    <template #actions>
      <div v-if="fix" class="eslint-editor-actions">
        <label>
          <input
            v-model="previewFix"
            type="checkbox"
          /><!-- eslint-disable-line @mysticatea/prettier -->
          Preview
        </label>
        <button @click="applyAutofix">Apply</button>
      </div>
    </template>
  </MonacoEditor>
</template>

<script lang="ts">
import type {
  MonacoEditor as TEditor,
  MonacoEditorLanguages,
} from "@ota-meshi/site-kit-monaco-editor"
import type { ProvideCodeActions } from "@ota-meshi/site-kit-monaco-editor"
import type { Linter } from "eslint"
import { defineComponent } from "vue"
import MonacoEditor from "@ota-meshi/site-kit-monaco-editor-vue/MonacoEditor.vue"
type VIMonacoEditor = InstanceType<typeof MonacoEditor>

/**
 * Ensure that a given value is a positive value.
 * @param value The value to check.
 * @param defaultValue The default value which is used if the `value` is undefined.
 * @returns The positive value as the result.
 */
function ensurePositiveInt(value: number | undefined, defaultValue: number) {
  return Math.max(1, (value !== undefined ? value : defaultValue) | 0)
}

/**
 * Computes the key string from the given marker.
 * @param marker marker
 * @returns the key string
 */
function computeKey(marker: TEditor.IMarkerData) {
  const code =
    (typeof marker.code === "string"
      ? marker.code
      : marker.code && marker.code.value) || ""
  return `[${marker.startLineNumber},${marker.startColumn},${marker.endLineNumber},${marker.endColumn}]-${code}`
}

/**
 * Create quickfix code action.
 * @returns CodeAction
 */
function createQuickfixCodeAction(
  title: string,
  marker: TEditor.IMarkerData,
  model: TEditor.ITextModel,
  fix: { range: [number, number]; text: string },
): MonacoEditorLanguages.CodeAction {
  const start = model.getPositionAt(fix.range[0])
  const end = model.getPositionAt(fix.range[1])
  /**
   * @type {import('monaco-editor').IRange}
   */
  const editRange = {
    startLineNumber: start.lineNumber,
    startColumn: start.column,
    endLineNumber: end.lineNumber,
    endColumn: end.column,
  }
  return {
    title,
    diagnostics: [marker],
    kind: "quickfix",
    edit: {
      edits: [
        {
          resource: model.uri,
          textEdit: {
            range: editRange,
            text: fix.text,
          },
          versionId: model.getVersionId(),
        },
      ],
    },
  }
}

export default defineComponent({
  name: "ESLintEditor",
  components: {
    MonacoEditor,
  },
  props: {
    linter: {
      type: Object as any as typeof Linter | null,
      default: null,
    },
    code: {
      type: String,
      default: "",
    },
    config: {
      type: Object,
      default() {
        return {}
      },
    },
    filename: {
      type: String,
      default: "a.js",
    },
    preprocess: {
      type: Function,
      default: null,
      required: false,
    },
    postprocess: {
      type: Function,
      default: null,
      required: false,
    },
    fix: {
      type: Boolean,
    },
    language: {
      type: String,
      default: "javascript",
    },
  },
  emits: ["input", "change", "update:code"],

  data() {
    return {
      editorValue: this.code,
      editing: null as null | number,
      messages: [] as Linter.LintMessage[],
      fixedCode: this.code,
      fixedMessages: [] as Linter.LintMessage[],
      previewFix: false,
      requestFix: false,
      editorMessageMap: new Map<
        TEditor.ITextModel["uri"],
        Map<string, Linter.LintMessage>
      >(),
    }
  },

  computed: {
    provideCodeActions(): ProvideCodeActions {
      return (model, _range, context) => {
        const { editorMessageMap } = this
        const messageMap = editorMessageMap.get(model.uri)
        if (context.only !== "quickfix" || !messageMap) {
          return {
            actions: [],
            dispose() {
              /* nop */
            },
          }
        }

        const actions: MonacoEditorLanguages.CodeAction[] = []
        for (const marker of context.markers) {
          const message = messageMap.get(computeKey(marker))
          if (!message) {
            continue
          }
          if (message.fix) {
            actions.push(
              createQuickfixCodeAction(
                `Fix this ${message.ruleId!} problem`,
                marker,
                model,
                message.fix,
              ),
            )
          }
          if (message.suggestions) {
            for (const suggestion of message.suggestions) {
              actions.push(
                createQuickfixCodeAction(
                  `${suggestion.desc} (${message.ruleId!})`,
                  marker,
                  model,
                  suggestion.fix,
                ),
              )
            }
          }
        }

        return {
          actions,
          dispose() {
            /* nop */
          },
        }
      }
    },
    markers() {
      const monacoEditor = this.$refs.monacoEditor as VIMonacoEditor | undefined
      const editor = monacoEditor?.getLeftEditor()
      return this.messagesToMarkers(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call -- parser bug?
        editor?.getModel() ?? null,
        this.messages,
        true,
      )
    },
    rightMarkers() {
      const monacoEditor = this.$refs.monacoEditor as VIMonacoEditor | undefined
      const editor = monacoEditor?.getRightEditor()
      return this.messagesToMarkers(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call -- parser bug?
        editor?.getModel() ?? null,
        this.fixedMessages,
        false,
      )
    },
  },

  watch: {
    linter() {
      this.invalidate()
    },
    code(value) {
      this.editorValue = value
    },
    editorValue() {
      this.initialize()
    },
    previewFix() {
      this.initialize()
    },
    config: {
      handler() {
        this.invalidate()
      },
      deep: true,
    },
    filename() {
      this.invalidate()
    },
    fix() {
      this.initialize()
    },
  },

  methods: {
    initialize() {
      this.lint()
    },

    messageToMarker(message: Linter.LintMessage): TEditor.IMarkerData {
      const { linter } = this
      const rule = message.ruleId && linter.getRules().get(message.ruleId)
      const docUrl =
        rule && rule.meta && rule.meta.docs && (rule.meta.docs.url as any)
      const startLineNumber = ensurePositiveInt(message.line, 1)
      const startColumn = ensurePositiveInt(message.column, 1)
      const endLineNumber = ensurePositiveInt(message.endLine, startLineNumber)
      const endColumn = ensurePositiveInt(message.endColumn, startColumn + 1)

      const code = docUrl
        ? { value: message.ruleId!, link: docUrl, target: docUrl }
        : message.ruleId || "FATAL"

      return {
        code,
        severity: 8, // monaco.MarkerSeverity.Error,
        source: "ESLint",
        message: message.message,
        startLineNumber,
        startColumn,
        endLineNumber,
        endColumn,
      }
    },

    messagesToMarkers(
      model: TEditor.ITextModel | null,
      messages: Linter.LintMessage[],
      storeMessageMap: boolean,
    ): TEditor.IMarkerData[] {
      const { editorMessageMap } = this

      if (model) editorMessageMap.delete(model.uri)
      const markers: TEditor.IMarkerData[] = []
      let messageMap: Map<string, Linter.LintMessage> | null = null
      if (storeMessageMap) {
        messageMap = new Map()
        if (model) editorMessageMap.set(model.uri, messageMap)
      }
      for (const message of messages) {
        const marker = this.messageToMarker(message)
        markers.push(marker)
        if (messageMap) {
          messageMap.set(computeKey(marker), message)
        }
      }

      return markers
    },

    invalidate() {
      if (this.editing != null) {
        clearTimeout(this.editing)
      }
      this.editing = setTimeout(() => {
        this.lint()
        this.editing = null
      }, 667)
    },

    lint() {
      const { config, filename, preprocess, postprocess, linter } = this
      if (linter == null) {
        return
      }
      this.editorMessageMap.clear()
      const code = this.editorValue

      // Lint
      try {
        this.messages = linter.verify(code, config, {
          filename,
          preprocess,
          postprocess,
        } as any as string)
      } catch (err) {
        this.messages = [
          {
            fatal: true,
            ruleId: null,
            severity: 2,
            message: (err as Error).message,
            line: 1,
            column: 0,
          },
        ]
      }

      // Fix
      try {
        const ret = linter.verifyAndFix(code, config, { filename })
        this.fixedCode = ret.fixed ? ret.output : code
        this.fixedMessages = ret.messages
      } catch (err) {
        this.fixedCode = code
        this.fixedMessages = [
          {
            fatal: true,
            ruleId: null,
            severity: 2,
            message: (err as Error).message,
            line: 1,
            column: 0,
          },
        ]
      }

      this.$emit("change", {
        code,
        messages: this.messages,
        fixedCode: this.fixedCode,
        fixedMessages: this.fixedMessages,
      })

      if (this.requestFix) {
        this.requestFix = false
        if (this.fixedCode !== this.editorValue) {
          this.editorValue = this.fixedCode
          this.$emit("update:code", this.fixedCode)
        }
      }
    },

    applyAutofix() {
      const { editorValue, fixedCode, editing } = this
      if (editing) {
        this.requestFix = true
      } else if (fixedCode !== editorValue) {
        this.editorValue = this.fixedCode
        this.$emit("update:code", fixedCode)
      }
    },
  },
})
</script>

<style scoped>
.eslint-editor-actions {
  display: flex;
  flex-direction: row;
  position: absolute;
  right: 20px;
  bottom: 8px;
  border: 1px solid gray;
  border-radius: 4px;
  opacity: 0.3;
  transition: opacity 0.3s;
}
.eslint-editor-actions:hover {
  opacity: 1;
}
.eslint-editor-actions::before {
  content: "🔧";
  display: inline-block;
  margin: 2px;
  padding: 5px;
  font-size: 1em;
  vertical-align: middle;
}

.eslint-editor-actions,
.eslint-editor-actions button {
  background-color: #1e1e1e;
  color: #d4d4d4;
}

.eslint-editor-actions > * {
  display: inline-block;
  box-sizing: border-box;
  width: 80px;
  margin: 2px;
  padding: 4px 8px;
  border: 1px solid gray;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1em;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
}
.eslint-editor-actions > *:hover {
  background-color: rgba(128, 128, 128, 0.2);
}
.eslint-editor-actions > *:active {
  background-color: rgba(128, 128, 128, 0.4);
}
.eslint-editor-actions input[type="checkbox"] {
  display: none;
}
</style>
