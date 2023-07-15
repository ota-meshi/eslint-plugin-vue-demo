<template>
  <EslintEditor
    :linter="resolvedLinter"
    :config="config"
    :code="modelValue"
    class="eslint-code-block"
    filename="ExampleComponent.vue"
    language="html"
    :preprocess="vueProcessor.preprocess"
    :postprocess="vueProcessor.postprocess"
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

<script lang="ts">
import { computed, reactive } from "vue"
import { Linter } from "eslint"
import type { Linter as LinterType } from "eslint"
import { parseForESLint } from "vue-eslint-parser"
// @ts-expect-error -- ignore
import { rules as vueRules, processors } from "eslint-plugin-vue"
// @ts-expect-error -- ignore
import { rules as a11yRules } from "eslint-plugin-vuejs-accessibility"
import EslintEditor from "@ota-meshi/site-kit-eslint-editor-vue"

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- ignore
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

const loadedParsers = reactive({
  parsers: { "@typescript-eslint/parser": false } as Record<string, any>,
})
// @ts-expect-error -- use require-parser
window.loadedParsers = loadedParsers

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
const config = computed<LinterType.Config>(() => {
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
      parser: resolvedParser.value,
    },
    rules: props.rules,
    env: {
      browser: true,
      es2021: true,
    },
  }
})

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

<style></style>
