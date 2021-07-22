import Linter from "eslint4b"
// @ts-expect-error -- ignore
import { rules as vueRules } from "eslint-plugin-vue"

const linter = new Linter()

export type Rule = {
  ruleId: string
  rule: any
  url: string | undefined
  classes?: string
}
export type Category = {
  title: string
  rules: Rule[]
  isTarget?: (ruleCategories: string[] | void, rule: any) => boolean | void
  classes?: string
}

export const categories: Category[] = [
  {
    title: "Base Rules",
    isTarget: (ruleCategories) =>
      ruleCategories && ruleCategories.includes("base"),
    rules: [],
    classes: "eslint-plugin-vue-category",
  },
  {
    title: "Priority A: Essential",
    isTarget: (ruleCategories) =>
      ruleCategories &&
      ruleCategories.includes("vue3-essential") &&
      ruleCategories.includes("essential"),
    rules: [],
    classes: "eslint-plugin-vue-category",
  },
  {
    title: "Priority A: Essential (for Vue.js 3.x)",
    isTarget: (ruleCategories) =>
      ruleCategories &&
      ruleCategories.includes("vue3-essential") &&
      !ruleCategories.includes("essential"),
    rules: [],
    classes: "eslint-plugin-vue-category",
  },
  {
    title: "Priority A: Essential (for Vue.js 2.x)",
    isTarget: (ruleCategories) =>
      ruleCategories &&
      !ruleCategories.includes("vue3-essential") &&
      ruleCategories.includes("essential"),
    rules: [],
    classes: "eslint-plugin-vue-category",
  },
  {
    title: "Priority B: Strongly Recommended",
    isTarget: (ruleCategories) =>
      ruleCategories &&
      ruleCategories.includes("vue3-strongly-recommended") &&
      ruleCategories.includes("strongly-recommended"),
    rules: [],
    classes: "eslint-plugin-vue-category",
  },
  {
    title: "Priority B: Strongly Recommended (for Vue.js 3.x)",
    isTarget: (ruleCategories) =>
      ruleCategories &&
      ruleCategories.includes("vue3-strongly-recommended") &&
      !ruleCategories.includes("strongly-recommended"),
    rules: [],
    classes: "eslint-plugin-vue-category",
  },
  {
    title: "Priority B: Strongly Recommended (for Vue.js 2.x)",
    isTarget: (ruleCategories) =>
      ruleCategories &&
      !ruleCategories.includes("vue3-strongly-recommended") &&
      ruleCategories.includes("strongly-recommended"),
    rules: [],
    classes: "eslint-plugin-vue-category",
  },
  {
    title: "Priority C: Recommended",
    isTarget: (ruleCategories) =>
      ruleCategories &&
      ruleCategories.includes("vue3-recommended") &&
      ruleCategories.includes("recommended"),
    rules: [],
    classes: "eslint-plugin-vue-category",
  },
  {
    title: "Priority C: Recommended (for Vue.js 3.x)",
    isTarget: (ruleCategories) =>
      ruleCategories &&
      ruleCategories.includes("vue3-recommended") &&
      !ruleCategories.includes("recommended"),
    rules: [],
    classes: "eslint-plugin-vue-category",
  },
  {
    title: "Priority C: Recommended (for Vue.js 2.x)",
    isTarget: (ruleCategories) =>
      ruleCategories &&
      !ruleCategories.includes("vue3-recommended") &&
      ruleCategories.includes("recommended"),
    rules: [],
    classes: "eslint-plugin-vue-category",
  },
  {
    title: "Uncategorized",
    isTarget: (_ruleCategories, rule) => !rule.meta.docs.extensionRule,
    rules: [],
    classes: "eslint-plugin-vue-category",
  },
  {
    title: "Extension Rules",
    isTarget: (_ruleCategories, rule) => rule.meta.docs.extensionRule,
    rules: [],
    classes: "eslint-plugin-vue-category",
  },
  {
    title: "Possible Errors",
    rules: [],
    classes: "eslint-category",
  },
  {
    title: "Best Practices",
    rules: [],
    classes: "eslint-category",
  },
  {
    title: "Strict Mode",
    rules: [],
    classes: "eslint-category",
  },
  {
    title: "Variables",
    rules: [],
    classes: "eslint-category",
  },
  {
    title: "Stylistic Issues",
    rules: [],
    classes: "eslint-category",
  },
  {
    title: "ECMAScript 6",
    rules: [],
    classes: "eslint-category",
  },
]
export const DEFAULT_RULES_CONFIG: Record<string, "error"> = {}

for (const baseRuleId of Object.keys(vueRules)) {
  const rule = vueRules[baseRuleId]
  if (rule.meta.deprecated) {
    continue
  }
  const ruleId = `vue/${baseRuleId}`
  const data: Rule = {
    ruleId,
    rule,
    url: rule.meta.docs.url,
    classes: "eslint-plugin-vue-rule",
  }
  const ruleCategories = rule.meta.docs.category
    ? [rule.meta.docs.category]
    : rule.meta.docs.categories
  categories.find((c) => c.isTarget?.(ruleCategories, rule))?.rules.push(data)

  if (
    ruleCategories?.includes("base") ||
    ruleCategories?.includes("vue3-essential")
  ) {
    DEFAULT_RULES_CONFIG[ruleId] = "error"
  }
}
for (const [ruleId, rule] of linter.getRules()) {
  if (rule.meta?.deprecated) {
    continue
  }
  const data: Rule = {
    ruleId,
    rule,
    url: rule.meta?.docs?.url,
  }
  const category = rule.meta?.docs?.category
  categories.find((c) => c.title === category)?.rules.push(data)

  if (rule.meta?.docs?.recommended) {
    DEFAULT_RULES_CONFIG[ruleId] = "error"
  }
}
/** get url */
export function getURL(ruleId: string | null): string | null | undefined {
  if (!ruleId) {
    return null
  }
  if (ruleId.startsWith("vue/")) {
    return vueRules[ruleId.slice(4)]?.meta?.docs?.url
  }
  return linter.getRules().get(ruleId)?.meta?.docs?.url
}
