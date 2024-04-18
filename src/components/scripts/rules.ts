import { Linter } from "eslint"
// @ts-expect-error -- ignore
import { rules as vueRules } from "eslint-plugin-vue"
import { rules as a11yRules } from "eslint-plugin-vuejs-accessibility"

const linter = new Linter()
const coreRules = new Set(linter.getRules().values())

export type Rule = {
  ruleId: string
  rule: any
  url: string
  classes: string
}
export type Category = {
  title: string
  rules: Rule[]
  isTarget?: (ruleCategories: string[] | void, rule: any) => boolean | void
  classes: string
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
    isTarget: (_ruleCategories, rule) =>
      Object.values(vueRules).includes(rule) && !rule.meta.docs.extensionRule,
    rules: [],
    classes: "eslint-plugin-vue-category",
  },
  {
    title: "Extension Rules",
    isTarget: (_ruleCategories, rule) =>
      Object.values(vueRules).includes(rule) && rule.meta.docs.extensionRule,
    rules: [],
    classes: "eslint-plugin-vue-category",
  },
  {
    title: "Possible Errors",
    isTarget: (_ruleCategories, rule) =>
      coreRules.has(rule) && rule.meta.type === "problem",
    rules: [],
    classes: "eslint-category",
  },
  {
    title: "Suggestions",
    isTarget: (_ruleCategories, rule) =>
      coreRules.has(rule) && rule.meta.type === "suggestion",
    rules: [],
    classes: "eslint-category",
  },
  {
    title: "Layout & Formatting",
    isTarget: (_ruleCategories, rule) =>
      coreRules.has(rule) && rule.meta.type === "layout",
    rules: [],
    classes: "eslint-category",
  },
  {
    title: "eslint-plugin-vuejs-accessibility",
    isTarget: (_ruleCategories, rule) =>
      Object.values(a11yRules).includes(rule),
    rules: [],
    classes: "eslint-plugin-vuejs-accessibility-category",
  },
]
export const DEFAULT_RULES_CONFIG: Record<string, "error"> = {}

for (const [baseRuleId, rule] of Object.entries(vueRules) as [string, any][]) {
  if (rule.meta.deprecated) {
    continue
  }
  const ruleId = `vue/${baseRuleId}`
  const data: Rule = {
    ruleId,
    rule,
    url: rule.meta.docs.url || "",
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
for (const [baseRuleId, rule] of Object.entries(a11yRules)) {
  if (rule.meta!.deprecated) {
    continue
  }
  const ruleId = `vuejs-accessibility/${baseRuleId}`
  const data: Rule = {
    ruleId,
    rule,
    url: rule.meta!.docs!.url || "",
    classes: "eslint-plugin-vuejs-accessibility-rule",
  }
  categories
    .find(
      (c) =>
        c.isTarget?.([], rule) &&
        c.classes?.includes("eslint-plugin-vuejs-accessibility"),
    )
    ?.rules.push(data)
}
for (const [ruleId, rule] of linter.getRules()) {
  if (rule.meta?.deprecated) {
    continue
  }
  const data: Rule = {
    ruleId,
    rule,
    url: rule.meta?.docs?.url || "",
    classes: "eslint-rule",
  }
  categories.find((c) => c.isTarget?.([], rule))?.rules.push(data)

  if (rule.meta?.docs?.recommended) {
    DEFAULT_RULES_CONFIG[ruleId] = "error"
  }
}
/** get rule */
export function getRule(ruleId: string | null): Rule | null {
  if (!ruleId) {
    return null
  }
  for (const category of categories) {
    for (const rule of category.rules) {
      if (rule.ruleId === ruleId) {
        return rule
      }
    }
  }
  let rule: any, classes: string
  if (ruleId.startsWith("vue/")) {
    rule = vueRules[ruleId.slice(4)]
    classes = "eslint-plugin-vue-rule"
  } else if (ruleId.startsWith("vuejs-accessibility/")) {
    rule = a11yRules[ruleId.slice(20) as keyof typeof a11yRules]
    classes = "eslint-plugin-vuejs-accessibility-rule"
  } else {
    rule = linter.getRules().get(ruleId)
    classes = "eslint-rule"
  }
  return rule
    ? {
        ruleId,
        rule,
        url: rule.meta?.docs?.url || "",
        classes,
      }
    : null
}
