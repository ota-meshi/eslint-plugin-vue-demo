<script lang="ts">
import { computed, reactive } from "vue"
import { Linter } from "eslint"
import type { Linter as LinterType } from "eslint"
import * as vueParser from "vue-eslint-parser"
import globals from "globals"
// @ts-expect-error -- ignore
import { rules as vueRules, processors } from "eslint-plugin-vue"
import { rules as a11yRules } from "eslint-plugin-vuejs-accessibility"
import EslintEditor from "@ota-meshi/site-kit-eslint-editor-vue"

const linter = new Linter({ configType: "flat" })

const loadedParsers = reactive({
  parsers: { "@typescript-eslint/parser": false } as Record<string, any>,
})
// @ts-expect-error -- use require-parser
window.loadedParsers = loadedParsers

const plugins = {
  vue: {
    rules: vueRules,
    processors,
  },
  "vuejs-accessibility": {
    rules: a11yRules,
  },
}

export default {}
</script>

<script lang="ts" setup>
const props = defineProps({
  modelValue: {
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
})
const emits = defineEmits({
  "update:modelValue": (value: string) => true,
  "update-messages": (messages: any[]) => true,
})

const resolvedParser = computed(() =>
  !props.parser || props.parser === "espree" ? undefined : props.parser,
)
const parserList = computed((): string[] => {
  const parser = resolvedParser.value
  if (!parser) {
    return []
  }
  if (typeof parser === "string") {
    return [parser]
  }
  return Object.values(parser) as string[]
})

const resolvedLinter = computed(() => {
  if (!resolvedParser.value) {
    return linter
  }
  for (const parser of parserList.value) {
    if (!loadedParsers.parsers[parser]) {
      // eslint-disable-next-line vue/no-async-in-computed-properties -- ignore
      loadParser(parser).catch((e) => {
        throw e
      })

      return null
    }
  }

  return linter
})
const config = computed<LinterType.FlatConfig[]>(
  (): LinterType.FlatConfig[] => {
    return [
      {
        files: ["**"],
        processor: "vue/vue",
        plugins: plugins as any,
        languageOptions: {
          globals: {
            ...globals.builtin,
            ...globals.browser,
            ...globals.es2021,
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
          parser: vueParser,
          parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parser: resolvedParser.value,
          },
        },
        rules: props.rules,
      },
    ]
  },
)

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

/**
 * Handle input event
 */
function onInput(value: string) {
  emits("update:modelValue", value)
}

/**
 * Handle change event
 */
function onChange(data: { messages: any[] }) {
  emits("update-messages", data.messages)
}
</script>

<template>
  <EslintEditor
    :linter="resolvedLinter"
    :config="config as any"
    :code="modelValue"
    class="eslint-code-block"
    filename="ExampleComponent.vue"
    language="html"
    dark
    :format="{
      insertSpaces: true,
      tabSize: 2,
    }"
    fix
    @update:code="onInput"
    @change="onChange"
  />
</template>

<style></style>
