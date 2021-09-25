<template>
  <EslintEditor
    :linter="linter"
    :config="config"
    :code="value"
    class="eslint-code-block"
    filename="Example.vue"
    language="html"
    :preprocess="preprocess"
    :postprocess="postprocess"
    dark
    :format="{
      insertSpaces: true,
      tabSize: 2,
    }"
    fix
    @input="onInput"
    @change="onChange"
  />
</template>

<script lang="ts">
import Vue from "vue"
import EslintEditor from "vue-eslint-editor"
import { parseForESLint } from "vue-eslint-parser"
import { Linter } from "eslint"
import type { Linter as LinterType } from "eslint"
// @ts-expect-error -- ignore
import { rules as vueRules, processors } from "eslint-plugin-vue"
// @ts-expect-error -- ignore
import { rules as a11yRules } from "eslint-plugin-vuejs-accessibility"
import type { ThisTypedComponentOptionsWithRecordProps } from "vue/types/options"

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- ignore
const vueProcessor: LinterType.Processor = processors[".vue"]

const linter = new Linter()
linter.defineParser("vue-eslint-parser", {
  parseForESLint: parseForESLint as never,
})
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- ignore
for (const ruleId of Object.keys(vueRules)) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument -- ignore
  linter.defineRule(`vue/${ruleId}`, vueRules[ruleId])
}
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- ignore
for (const ruleId of Object.keys(a11yRules)) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument -- ignore
  linter.defineRule(`vuejs-accessibility/${ruleId}`, a11yRules[ruleId])
}

const loadedParsers = new Vue({
  data() {
    return {
      parsers: { "@typescript-eslint/parser": false } as Record<
        string,
        boolean | any
      >,
    }
  },
})
// @ts-expect-error -- use require-parser
window.loadedParsers = loadedParsers

/**
 * Load parser
 */
async function loadParser(parser: string) {
  if (parser === "@typescript-eslint/parser") {
    loadedParsers.parsers["@typescript-eslint/parser"] = await import(
      "@typescript-eslint/parser"
    )
  }
}

// eslint-disable-next-line @typescript-eslint/unbound-method -- ignore
const verifyAndFix = linter.verifyAndFix

linter.verifyAndFix = function (
  code: string,
  config: LinterType.Config,
  option: LinterType.LintOptions,
  ...args: []
) {
  /* eslint-disable no-invalid-this -- ignore */
  return verifyAndFix.call(
    // @ts-expect-error -- ignore
    this,
    code,
    config,
    {
      /* eslint-disable @typescript-eslint/unbound-method -- ignore */
      // @ts-expect-error -- ignore
      preprocess: vueProcessor.preprocess,
      // @ts-expect-error -- ignore
      postprocess: vueProcessor.postprocess,
      /* eslint-enable @typescript-eslint/unbound-method -- ignore */
      ...option,
    },
    ...args,
  )
  /* eslint-enable no-invalid-this -- ignore */
} as never

type Component = ThisTypedComponentOptionsWithRecordProps<
  Vue,
  {},
  {},
  {
    linter: Linter
    config: any
    preprocess: any
    postprocess: any
    resolvedParser: string | Record<string, string> | undefined
    parserList: string[]
  },
  {
    value: string
    rules: Record<string, "error" | "off" | 2>
    parser: string | Record<string, string> | undefined
  }
>
export default {
  components: { EslintEditor },
  props: {
    value: {
      type: String,
      default: "",
    },
    rules: {
      type: Object,
      default() {
        return {}
      },
    },
    parser: {
      type: [String, Object],
      default: undefined,
    },
  },
  computed: {
    resolvedParser() {
      return !this.parser || this.parser === "espree" ? undefined : this.parser
    },
    parserList(): string[] {
      const parser = this.resolvedParser
      if (!parser) {
        return []
      }
      if (typeof parser === "string") {
        return [parser]
      }
      return Object.values(parser)
    },
    // eslint-disable-next-line @typescript-eslint/unbound-method -- ignore
    preprocess: () => vueProcessor.preprocess,
    // eslint-disable-next-line @typescript-eslint/unbound-method -- ignore
    postprocess: () => vueProcessor.postprocess,
    linter() {
      if (!this.resolvedParser) {
        return linter
      }
      for (const parser of this.parserList) {
        if (!loadedParsers.parsers[parser]) {
          loadParser(parser).catch((e) => {
            throw e
          })

          return null
        }
      }

      return linter
    },
    config() {
      return {
        globals: {
          console: false,
          // ES2015 globals
          ArrayBuffer: false,
          DataView: false,
          Float32Array: false,
          Float64Array: false,
          Int16Array: false,
          Int32Array: false,
          Int8Array: false,
          Map: false,
          Promise: false,
          Proxy: false,
          Reflect: false,
          Set: false,
          Symbol: false,
          Uint16Array: false,
          Uint32Array: false,
          Uint8Array: false,
          Uint8ClampedArray: false,
          WeakMap: false,
          WeakSet: false,
          // ES2017 globals
          Atomics: false,
          SharedArrayBuffer: false,
        },
        parser: "vue-eslint-parser",
        parserOptions: {
          ecmaVersion: 2020,
          sourceType: "module",
          parser: this.resolvedParser,
        },
        rules: this.rules,
        env: {
          browser: true,
          es2021: true,
        },
      }
    },
  },
  methods: {
    onInput(value: string) {
      this.$emit("input", value)
    },
    onChange(data: { messages: any[] }) {
      this.$emit("update-messages", data.messages)
    },
  },
} as Component
</script>

<style></style>
