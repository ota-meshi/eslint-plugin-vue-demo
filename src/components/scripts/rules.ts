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
}

export const categories: Category[] = [
    {
        title: "Base Rules",
        rules: [],
        isTarget: (ruleCategories) =>
            ruleCategories && ruleCategories.includes("base"),
    },
    {
        title: "Priority A: Essential",
        isTarget: (ruleCategories) =>
            ruleCategories &&
            (ruleCategories.includes("vue3-essential") ||
                ruleCategories.includes("essential")),
        rules: [],
    },
    {
        title: "Priority B: Strongly Recommended",
        isTarget: (ruleCategories) =>
            ruleCategories &&
            (ruleCategories.includes("vue3-strongly-recommended") ||
                ruleCategories.includes("strongly-recommended")),
        rules: [],
    },
    {
        title: "Priority C: Recommended",
        isTarget: (ruleCategories) =>
            ruleCategories &&
            (ruleCategories.includes("vue3-recommended") ||
                ruleCategories.includes("recommended")),
        rules: [],
    },
    {
        title: "Uncategorized",
        isTarget: (_ruleCategories, rule) => !rule.meta.docs.extensionRule,
        rules: [],
    },
    {
        title: "Extension Rules",
        isTarget: (_ruleCategories, rule) => rule.meta.docs.extensionRule,
        rules: [],
    },
    {
        title: "Possible Errors",
        rules: [],
    },
    {
        title: "Best Practices",
        rules: [],
    },
    {
        title: "Strict Mode",
        rules: [],
    },
    {
        title: "Variables",
        rules: [],
    },
    {
        title: "Stylistic Issues",
        rules: [],
    },
    {
        title: "ECMAScript 6",
        rules: [],
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
