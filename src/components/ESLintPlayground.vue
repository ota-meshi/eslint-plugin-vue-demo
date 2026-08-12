<template>
  <div class="playground-root">
    <div class="playground-content">
      <RulesSettings
        v-model:rules="rules"
        v-model:parser="parser"
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
              :class="msg.ruleId && getRule(msg.ruleId)!.classes"
            >
              [{{ msg.line }}:{{ msg.column }}]: {{ msg.message }} (<a
                :href="msg.ruleId && getRule(msg.ruleId)!.url"
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

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import ESLintEditor from "./ESLintEditor.vue"
import RulesSettings from "./RulesSettings.vue"
import { deserializeState, serializeState } from "./scripts/state/index"
import { DEFAULT_RULES_CONFIG, getRule } from "./scripts/rules"

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

const initialState = deserializeState(
  (typeof window !== "undefined" && window.location.hash.slice(1)) || "",
)
const code = ref(initialState.code || DEFAULT_CODE)
const rules = ref(initialState.rules || { ...DEFAULT_RULES_CONFIG })
const parser = ref(initialState.parser || "espree")
const messages = ref<any[]>([])

const serializedString = computed(() => {
  return serializeState({
    code: DEFAULT_CODE === code.value ? undefined : code.value,
    rules: equalsRules(DEFAULT_RULES_CONFIG, rules.value)
      ? undefined
      : rules.value,
    parser:
      !parser.value || parser.value === "espree" ? undefined : parser.value,
  })
})

watch(serializedString, (newSerializedString) => {
  if (typeof window !== "undefined") {
    window.location.replace(`#${newSerializedString}`)
  }
})

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("hashchange", onUrlHashChange)
  }
})
onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("hashchange", onUrlHashChange)
  }
})

/**
 * Handle update-messages event
 */
function onUpdateMessages(newMessages: any[]) {
  messages.value = newMessages
}

/**
 * Handle URL hash change
 */
function onUrlHashChange() {
  const currentSerializedString =
    (typeof window !== "undefined" && window.location.hash.slice(1)) || ""
  if (currentSerializedString !== serializedString.value) {
    const state = deserializeState(currentSerializedString)
    code.value = state.code || DEFAULT_CODE
    rules.value = state.rules || { ...DEFAULT_RULES_CONFIG }
  }
}

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

.eslint-rule a {
  color: #8080f2;
}
.eslint-plugin-vue-rule a {
  color: #3eaf7c;
}
.eslint-plugin-vuejs-accessibility-rule a {
  color: #397db1;
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
