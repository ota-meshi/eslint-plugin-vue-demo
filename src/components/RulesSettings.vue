<template>
  <div class="rules-settings">
    <div class="parser">
      <label>
        <span class="parser-label">Parser:</span>
        <select v-model="parserIndex" class="parser-select">
          <option v-for="(parser, i) in PARSERS" :key="i" :value="i">
            {{ parser }}
          </option>
        </select>
      </label>
    </div>
    <div class="tools">
      <div class="tools-title" @click="state.toolsClose = !state.toolsClose">
        Tools
        <button
          class="tools-button"
          :class="{ 'tools-button--close': state.toolsClose }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="10"
            viewBox="0 0 10 10"
            width="10"
          >
            <path d="M2.5 10l5-5-5-5v10z" fill="#ddd" />
          </svg>
        </button>
      </div>
      <template v-if="!state.toolsClose">
        <label class="tool">
          <span class="tool-label">Filter:</span>
          <input
            v-model="filterValue"
            type="search"
            placeholder="Rule Filter"
            class="tool-form"
          />
        </label>
        <label class="tool">
          <input
            :checked="
              categories.every((category) =>
                category.rules.every((rule) => isErrorState(rule.ruleId)),
              )
            "
            type="checkbox"
            :indeterminate.prop="
              categories.some((category) =>
                category.rules.some((rule) => isErrorState(rule.ruleId)),
              ) &&
              categories.some((category) =>
                category.rules.some((rule) => !isErrorState(rule.ruleId)),
              )
            "
            @input="onAllClick($event)"
          />
          <span>All Rules</span>
        </label>
      </template>
    </div>
    <ul class="categories">
      <template v-for="category in categories">
        <li
          v-if="category.rules.length"
          :key="category.title"
          class="category"
          :class="category.classes"
        >
          <button
            class="category-button"
            :class="{
              'category-button--close': categoryState[category.title].close,
            }"
            @click="
              categoryState[category.title].close =
                !categoryState[category.title].close
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="10"
              viewBox="0 0 10 10"
              width="10"
            >
              <path d="M2.5 10l5-5-5-5v10z" fill="#ddd" />
            </svg>
          </button>
          <div class="category-title-wrapper">
            <label class="category-title">
              <input
                :checked="
                  category.rules.every((rule) => isErrorState(rule.ruleId))
                "
                type="checkbox"
                :indeterminate.prop="
                  !category.rules.every((rule) => isErrorState(rule.ruleId)) &&
                  !category.rules.every((rule) => !isErrorState(rule.ruleId))
                "
                @input="onCategoryClick(category, $event)"
              />
              {{ category.title }}
            </label>
          </div>

          <ul v-show="!categoryState[category.title].close" class="rules">
            <li
              v-for="rule in category.rules"
              :key="rule.ruleId"
              class="rule"
              :class="rule.classes"
            >
              <label>
                <input
                  :checked="isErrorState(rule.ruleId)"
                  type="checkbox"
                  @input="onClick(rule.ruleId, $event)"
                />
                {{ rule.ruleId }}
              </label>
              <a :href="rule.url" target="_blank"
                ><svg
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  x="0px"
                  y="0px"
                  viewBox="0 0 100 100"
                  width="15"
                  height="15"
                  class="icon outbound"
                >
                  <path
                    fill="currentColor"
                    d="M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z"
                  />
                  <polygon
                    fill="currentColor"
                    points="45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9"
                  /></svg
              ></a>
            </li>
          </ul>
        </li>
      </template>
    </ul>
  </div>
</template>

<script lang="ts">
import type Vue from "vue"
import type { ThisTypedComponentOptionsWithRecordProps } from "vue/types/options"
import type { Rule, Category } from "./scripts/rules"
import { categories } from "./scripts/rules"

const PARSERS = [
  { ts: "@typescript-eslint/parser" },
  "espree",
  "@typescript-eslint/parser",
]
export default {
  name: "RulesSettings",
  props: {
    rules: {
      type: Object,
      required: true,
    },
    parser: {
      type: [String, Object],
    },
  },
  data() {
    let parserIndex = PARSERS.findIndex((p) => deppEq(p, this.parser))
    if (parserIndex < 0) {
      parserIndex = 0
    }
    return {
      PARSERS,
      categoryState: Object.fromEntries(
        categories.map((c) => {
          return [
            c.title,
            {
              close: true,
            },
          ]
        }),
      ),
      state: {
        toolsClose: true,
      },
      parserIndex,
      filterValue: "",
    }
  },
  computed: {
    categories(): Category[] {
      return categories.map((c) => {
        const rules = this.filterRules(c.rules)
        return {
          ...c,
          rules,
        }
      })
    },
  },
  watch: {
    parser() {
      this.parserIndex = PARSERS.findIndex((p) => deppEq(p, this.parser))
      if (this.parserIndex < 0) {
        this.parserIndex = 0
      }
    },
    parserIndex() {
      const parser = PARSERS[this.parserIndex]
      if (!deppEq(parser, this.parser)) {
        this.$emit("update:parser", parser)
      }
    },
  },
  methods: {
    filterRules(rules: Rule[]) {
      let filteredRules = rules
      if (this.filterValue) {
        filteredRules = filteredRules.filter((r) =>
          r.ruleId.includes(this.filterValue),
        )
      }
      return filteredRules
    },
    onCategoryClick(category: Category, e: MouseEvent) {
      const rules = Object.assign({}, this.rules)
      for (const rule of category.rules) {
        if ((e.target as HTMLInputElement).checked) {
          rules[rule.ruleId] = "error"
        } else {
          delete rules[rule.ruleId]
        }
      }
      this.$emit("update:rules", rules)
    },
    onAllClick(e: MouseEvent) {
      const rules = Object.assign({}, this.rules)
      for (const category of this.categories) {
        for (const rule of category.rules) {
          if ((e.target as HTMLInputElement).checked) {
            rules[rule.ruleId] = "error"
          } else {
            delete rules[rule.ruleId]
          }
        }
      }
      this.$emit("update:rules", rules)
    },
    onClick(ruleId: string, e: MouseEvent) {
      const rules = Object.assign({}, this.rules)
      if ((e.target as HTMLInputElement).checked) {
        rules[ruleId] = "error"
      } else {
        delete rules[ruleId]
      }
      this.$emit("update:rules", rules)
    },
    isErrorState(ruleId: string) {
      return this.rules[ruleId] === "error" || this.rules[ruleId] === 2
    },
  },
} as ThisTypedComponentOptionsWithRecordProps<
  Vue,
  { parserIndex: number; filterValue: string },
  { filterRules: (rules: Rule[]) => Rule[] },
  { categories: Category[] },
  {
    rules: Record<string, "error" | "off" | 2>
    parser: string | Record<string, string>
  }
>

/**
 * Checks whether the given values is equals
 */
function deppEq(a: any, b: any): boolean {
  if (a === b) {
    return true
  }
  if (
    a == null ||
    b == null ||
    typeof a !== "object" ||
    typeof b !== "object"
  ) {
    return false
  }
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) {
    return false
  }
  for (const key of aKeys) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- ignore
    if (!aKeys.includes(key) || !deppEq(a[key], b[key])) {
      return false
    }
  }
  return true
}
</script>

<style scoped>
.tools {
  background-color: #222;
}
.tool {
  display: flex;
}
.tool,
.parser,
.tools-title {
  padding: 4px;
}

.parser > label {
  display: flex;
  width: 100%;
}
.tool-label,
.parser-label {
  width: 3.5rem;
  flex-shrink: 0;
}
.tool-form,
.parser-select {
  width: 100%;
}
.tools-button {
  background-color: transparent;
  color: #ddd;
  border: none;
  appearance: none;
  cursor: pointer;
  padding: 0;
}
.tools-button--close {
  transform: rotate(90deg);
}
.filter .tool-label {
  color: #ddd;
}

.categories {
  font-size: 14px;
  list-style-type: none;
}
.category {
  position: relative;
}
.category-button {
  position: absolute;
  left: -24px;
  top: 2px;

  background-color: transparent;
  color: #ddd;
  border: none;
  appearance: none;
  cursor: pointer;
  padding: 0;
}
.category-button--close {
  transform: rotate(90deg);
}

.category-title {
  font-size: 14px;
  font-weight: bold;
}

.eslint-plugin-vue-category .category-title {
  color: #3eaf7c;
}
.eslint-category .category-title {
  color: #8080f2;
}
.eslint-plugin-vuejs-accessibility-category .category-title {
  color: #397db1;
}

.rules {
  padding-left: 0;
}

.rule {
  font-size: 12px;
  line-height: 24px;
  vertical-align: top;
  list-style-type: none;
  display: flex;
}

.rule a {
  margin-left: auto;
}

a {
  text-decoration: none;
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

.category {
  color: #fff;
}

.eslint-plugin-jsonc__category {
  color: #f8c555;
}
</style>
