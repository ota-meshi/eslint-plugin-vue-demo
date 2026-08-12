/**
 * Pre-bundle the CJS-distributed ESLint plugins/parsers into self-contained
 * ESM files so that Vite's dependency optimizer never needs to process them.
 *
 * Why: these packages `require("eslint")`, which must resolve to the virtual
 * modules provided by vite-plugin-eslint4b. The dep optimizer cannot load
 * virtual modules (and cannot convert a CJS require of an external into an
 * import), so the packages have to enter Vite as plain ESM. Pre-bundling
 * also keeps Vite 8's rolldown from re-bundling eslint-plugin-vue's dist,
 * which contains `$N`-suffixed identifiers that trigger a rolldown rename
 * bug (`var x$1 = x$1()`).
 *
 * External modules are left as bare imports and are resolved at app-build
 * time by vite-plugin-eslint4b (eslint) and the aliases in vite.config.ts
 * (node built-ins etc.). `require()` calls to them are rewired through an
 * inject map, the same technique vite-plugin-eslint4b uses internally.
 */
import fs from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { rolldown } from "rolldown"

const resolveModule = createRequire(import.meta.url).resolve
const outDir = fileURLToPath(new URL("../prebundled", import.meta.url))

const NODE_BUILTINS = ["path", "fs", "os", "util", "module", "assert", "events"]
const EXTERNALS = [
  // Provided by vite-plugin-eslint4b's virtual modules.
  "eslint",
  "eslint/use-at-your-own-risk",
  // Shared with the virtual eslint bundle via optimizeDeps.
  "espree",
  "eslint-scope",
  "esquery",
  "eslint-visitor-keys",
  // Resolved by the aliases in vite.config.ts.
  "globby",
  "fast-glob",
  "tinyglobby",
  ...NODE_BUILTINS.flatMap((id) => [id, `node:${id}`]),
]

const TARGETS = [
  { name: "eslint-plugin-vue", exportNames: ["rules", "processors"] },
  {
    name: "vue-eslint-parser",
    exportNames: ["AST", "meta", "parse", "parseForESLint"],
  },
  { name: "eslint-plugin-vuejs-accessibility", exportNames: ["rules"] },
]

for (const target of TARGETS) {
  await prebundle(target)
}

/**
 * Bundle the given package as CJS and wrap it into an ESM file.
 */
async function prebundle({ name, exportNames }) {
  const bundle = await rolldown({
    input: resolveModule(name),
    platform: "browser",
    external: EXTERNALS,
    plugins: [
      {
        name: "replace-require-resolve",
        transform(code, id) {
          // `require.resolve(...)` cannot work on the browser; replace it
          // with a dummy function call. (Only reached from the legacy
          // config definitions.)
          if (
            /eslint-plugin-vue(?:js-accessibility)?[/\\].*\.js$/u.test(id) &&
            code.includes("require.resolve")
          ) {
            return {
              code: code.replaceAll(
                "require.resolve",
                "(function(){return 0})",
              ),
              map: null,
            }
          }
          return undefined
        },
      },
      {
        // eslint-plugin-vue's dist is itself built with rolldown and
        // contains `$N`-suffixed identifiers such as `require_foo$1`.
        // When rolldown re-bundles it, its conflict renaming ignores
        // those pre-existing names and emits self-references like
        // `const require_foo$1 = require_foo$1()`. Renaming them away
        // from the `$N` pattern avoids the collision. Limited to the
        // `require_`/`import_` prefixes so that string literals such as
        // a `"_$1"` replacement pattern are never touched.
        name: "workaround-rolldown-rename-collision",
        transform(code) {
          if (!/\b(?:require|import)_\w+\$\d+\b/u.test(code)) {
            return undefined
          }
          return {
            code: code.replace(
              /\b((?:require|import)_\w+)\$(\d+)\b/gu,
              "$1_dollar_$2",
            ),
            map: null,
          }
        },
      },
    ],
  })
  const { output } = await bundle.generate({ format: "cjs" })
  await bundle.close()
  const cjsCode = output[0].code
  assertNoSelfReference(name, cjsCode)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(
    path.join(outDir, `${name}.mjs`),
    wrapAsEsm(cjsCode, exportNames),
  )
  console.log(`prebundled: ${name}`)
}

/**
 * Guard against the rolldown rename collision described above: broken
 * output assigns the result of calling an identifier to itself, e.g.
 * `const require_foo$1 = require_foo$1()`. Fail fast instead of shipping
 * a bundle that crashes at runtime.
 */
function assertNoSelfReference(name, code) {
  const selfReference = /\b(?:var|let|const)\s+([\w$]+)\s*=\s*\1\(\)/u.exec(
    code,
  )
  if (selfReference) {
    throw new Error(
      `${name}: rolldown produced a self-referencing binding ` +
        `"${selfReference[0]}"; the bundle would crash at runtime`,
    )
  }
}

/**
 * Wrap a CJS bundle into an ESM module, rewiring `require()` of
 * the externals to static imports.
 */
function wrapAsEsm(cjsCode, exportNames) {
  const injects = EXTERNALS.map((id, i) => ({ id, local: `$_inject_${i}_$` }))
  return `// Generated by scripts/prebundle.mjs — do not edit.
${injects
  .map(({ id, local }) => `import * as ${local} from ${JSON.stringify(id)};`)
  .join("\n")}
const $_injects_$ = {
${injects.map(({ id, local }) => `  ${JSON.stringify(id)}: ${local},`).join("\n")}
};
const $_module_$ = { exports: {} };
(function (module, exports, require) {
${cjsCode}
})($_module_$, $_module_$.exports, function require(id) {
  const mod = $_injects_$[id];
  if (!mod) throw new Error(\`Cannot require "\${id}"\`);
  return mod.default || mod;
});
export default $_module_$.exports;
${exportNames
  .map((n) => `export const ${n} = $_module_$.exports[${JSON.stringify(n)}];`)
  .join("\n")}
`
}
