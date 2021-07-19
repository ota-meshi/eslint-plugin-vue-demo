<template>
  <div class="playground-root">
    <div class="playground-content">
      <RulesSettings
        ref="settings"
        :rules.sync="rules"
        :parser.sync="parser"
        class="rules-settings"
      />
      <div class="editor-content">
        <ESLintEditor
          v-model="code"
          :rules="rules"
          :parser="parser"
          class="eslint-playground"
          @update-messages="onUpdateMessages"
        />
        <div class="messages">
          <ol>
            <li
              v-for="(msg, i) in messages"
              :key="msg.line + ':' + msg.column + ':' + msg.ruleId + '@' + i"
              class="message"
            >
              [{{ msg.line }}:{{ msg.column }}]: {{ msg.message }} (<a
                :href="getURL(msg.ruleId)"
                target="_blank"
              >
                {{ msg.ruleId }} </a
              >)
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type Vue from "vue"
import ESLintEditor from "./ESLintEditor.vue"
import RulesSettings from "./RulesSettings.vue"
import { deserializeState, serializeState } from "./scripts/state"
import { DEFAULT_RULES_CONFIG, getURL } from "./scripts/rules"
import type { ThisTypedComponentOptionsWithRecordProps } from "vue/types/options"

const DEFAULT_CODE =
  `<template>
  <input v-model="inputValue" />
  <button @click="handleClick" class="add-button">Add ToDo</button>
  <ul class="todo-list">
    <li
      v-for="(todo, index) in todoItems"
      :key="todo.id"
      class="todo-item"
      :class="{ 'todo-item--done': todo.done }"
      @click="todo.done = !todo.done"
    >
      <span v-if="todo.done">✓</span> {{ todo.text }}
    </li>
  </ul>
</template>
<script setup>
import { ref, computed } from "vue"
const inputValue = ref("")
const todoItems = ref([])

function handleClick() {
  todoItems.value.push({
    id: Math.random().toString(36).slice(-8),
    done: false,
    text: inputValue.value,
  })
  inputValue.value = ""
}

const buttonColor = computed(() => (inputValue ? "black" : "white"));
const buttonPointerEvents = computed(() =>
  inputValue.value ? "initial" : "none"
);
<` +
  // escape
  `/script>
<style>
.add-button {
  color: v-bind(buttonColor);
  pointer-events: v-bind("inputValue ? 'initial' : 'none'");
}
.todo-list {
  list-style: none;
}
.todo-item {
  background-color: #eef;
}
.todo-item--done {
  background-color: #3fb983;
  color: #fff;
}
</style>
`

type Data = {
  code: string
  rules: Record<string, "error" | "off">
  parser: string
  messages: any[]
}
type Methods = {
  onUrlHashChange: () => void
}
export default {
  name: "ESLintPlayground",
  components: {
    ESLintEditor,
    RulesSettings,
  },
  data(): Data {
    const serializedString =
      (typeof window !== "undefined" && window.location.hash.slice(1)) || ""
    const state = deserializeState(serializedString)
    return {
      code: state.code || DEFAULT_CODE,
      rules: state.rules || { ...DEFAULT_RULES_CONFIG },
      messages: [],
      parser: state.parser || "default",
    }
  },
  computed: {
    serializedString(): string {
      const defaultCode = DEFAULT_CODE
      const defaultRules = DEFAULT_RULES_CONFIG
      const code = defaultCode === this.code ? undefined : this.code
      const rules = equalsRules(defaultRules, this.rules)
        ? undefined
        : this.rules
      const parser =
        !this.parser || this.parser === "default" ? undefined : this.parser
      const serializedString = serializeState({
        code,
        rules,
        parser,
      })
      return serializedString
    },
  },
  watch: {
    serializedString(serializedString: string) {
      if (typeof window !== "undefined") {
        window.location.replace(`#${serializedString}`)
      }
    },
  },
  mounted() {
    if (typeof window !== "undefined") {
      window.addEventListener("hashchange", this.onUrlHashChange)
    }
  },
  beforeDestroey() {
    if (typeof window !== "undefined") {
      window.removeEventListener("hashchange", this.onUrlHashChange)
    }
  },
  methods: {
    onUpdateMessages(messages: any[]) {
      this.messages = messages
    },
    getURL(ruleId: string) {
      return getURL(ruleId) || ""
    },
    onUrlHashChange() {
      const serializedString =
        (typeof window !== "undefined" && window.location.hash.slice(1)) || ""
      if (serializedString !== this.serializedString) {
        const state = deserializeState(serializedString)
        this.code = state.code || DEFAULT_CODE
        this.rules = state.rules || Object.assign({}, DEFAULT_RULES_CONFIG)
      }
    },
  },
} as ThisTypedComponentOptionsWithRecordProps<
  Vue,
  Data,
  Methods,
  { serializedString: string },
  {}
>

/** */
function equalsRules(
  a: Record<string, "error" | "off">,
  b: Record<string, "error" | "off">,
) {
  const akeys = Object.keys(a).filter((k) => a[k] !== "off")
  const bkeys = Object.keys(b).filter((k) => b[k] !== "off")
  if (akeys.length !== bkeys.length) {
    return false
  }

  for (const k of akeys) {
    if (a[k] !== b[k]) {
      return false
    }
  }
  return true
}
</script>
<style scoped>
.playground-root {
  height: 100%;
}
.playground-tools {
  height: 24px;
}
.playground-content {
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  border: 1px solid #cfd4db;
  background-color: #282c34;
  color: #f8c555;
}
a {
  color: #3eaf7c;
}

.playground-content > .rules-settings {
  height: 100%;
  overflow: auto;
  width: 25%;
  box-sizing: border-box;
}

.playground-content > .editor-content {
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #cfd4db;
  min-width: 1px;
}

.playground-content > .editor-content > .eslint-playground {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  padding: 3px;
}

.playground-content > .editor-content > .messages {
  height: 30%;
  width: 100%;
  overflow: auto;
  box-sizing: border-box;
  border-top: 1px solid #cfd4db;
  padding: 8px;
  font-size: 12px;
}
</style>
