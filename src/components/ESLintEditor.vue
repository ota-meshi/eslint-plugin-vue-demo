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
import Linter from "eslint4b"
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
for (const ruleId of Object.keys(vueRules)) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- ignore
  linter.defineRule(`vue/${ruleId}`, vueRules[ruleId])
}
for (const ruleId of Object.keys(a11yRules)) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- ignore
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
  code: any,
  config: any,
  option: any,
  ...args: any[]
) {
  /* eslint-disable no-invalid-this -- ignore */
  return verifyAndFix.call(
    // @ts-expect-error -- ignore
    this,
    code,
    config,
    {
      // eslint-disable-next-line @typescript-eslint/unbound-method -- ignore
      preprocess: vueProcessor.preprocess,
      // eslint-disable-next-line @typescript-eslint/unbound-method -- ignore
      postprocess: vueProcessor.postprocess,
      ...option,
    },
    // @ts-expect-error -- ignore
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
    resolvedParser: string | undefined
  },
  {
    value: string
    rules: Record<string, "error" | "off" | 2>
    parser: string | undefined
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
      type: String,
      default: undefined,
    },
  },
  computed: {
    resolvedParser() {
      return !this.parser || this.parser === "default" ? undefined : this.parser
    },
    // eslint-disable-next-line @typescript-eslint/unbound-method -- ignore
    preprocess: () => vueProcessor.preprocess,
    // eslint-disable-next-line @typescript-eslint/unbound-method -- ignore
    postprocess: () => vueProcessor.postprocess,
    linter() {
      if (!this.resolvedParser) {
        return linter
      }
      if (loadedParsers.parsers[this.resolvedParser]) {
        return linter
      }
      loadParser(this.resolvedParser).catch((e) => {
        throw e
      })

      return null
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
