import pluginVitest from '@vitest/eslint-plugin'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import type { Linter } from 'eslint'
import { globalIgnores } from 'eslint/config'
import skipFormatting from 'eslint-config-prettier/flat'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import pluginImportX from 'eslint-plugin-import-x'
import pluginOxlint from 'eslint-plugin-oxlint'
import pluginPlaywright from 'eslint-plugin-playwright'
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort'
import pluginVue from 'eslint-plugin-vue'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

// `npm run lint:launch` turns every leftover mock marker comment into an error (spec 9).
const isLaunchCheck = process.env.npm_lifecycle_event === 'lint:launch'

// Physical left/right classes break right-to-left layouts; use logical ones (ms-, pe-, start-, text-start).
const physicalDirectionClasses = [
  '/^(?:.+:)?-?[mp][lr]-/',
  '/^(?:.+:)?-?(?:left|right)-/',
  '/^(?:.+:)?(?:border|rounded)-(?:[lr]|[tb][lr])(?:-|$)/',
  '/^(?:.+:)?text-(?:left|right)$/',
  '/^(?:.+:)?(?:float|clear)-(?:left|right)$/',
  '/^(?:.+:)?scroll-[mp][lr]-/',
]

// Folder rules (spec 3.2): files in `target` must not import from `from`. Tests are exempt.
const appFolders = [
  'views',
  'components',
  'composables',
  'services',
  'stores',
  'schemas',
  'types',
  'utils',
  'router',
  'i18n',
  'constants',
  'config',
  'plugins',
]
const src = (folders: string[]) => folders.map((folder) => `./src/${folder}`)
const layerZones = [
  { target: './src/views', from: './src/services' },
  { target: './src/components', from: './src/services' },
  { target: './src/components/base', from: './src/components', except: ['./base'] },
  { target: './src/components/base', from: src(['composables', 'stores', 'router']) },
  { target: './src/composables', from: src(['components', 'views']) },
  {
    target: './src/services',
    from: src(['composables', 'components', 'stores', 'router', 'views']),
  },
  {
    target: src(['schemas', 'types', 'utils']),
    from: src([
      'components',
      'composables',
      'services',
      'stores',
      'router',
      'views',
      'plugins',
      'i18n',
    ]),
  },
  // The mock API reaches the app only through plugins/msw.ts (and tests).
  {
    target: [
      ...src(appFolders.filter((folder) => folder !== 'plugins')),
      './src/main.ts',
      './src/App.vue',
    ],
    from: './src/mocks',
  },
  { target: './src/mocks', from: src(appFolders.filter((folder) => folder !== 'types')) },
]

// Library containment (spec 2). Flat config doesn't merge one rule across blocks (the last
// matching block wins), so every block restates the full list of what its files may not import.
const containedLibraries = ['axios', 'reka-ui', '@lucide/vue', 'msw', '@sentry/vue']
const vueLibraries = ['vue', 'vue-router', 'pinia', 'vue-i18n']

function restrictImports(
  files: string[],
  allowed: string[],
  alsoForbidden: string[] = [],
): Linter.Config {
  const forbidden = [
    ...containedLibraries.filter((lib) => !allowed.includes(lib)),
    ...alsoForbidden,
  ]
  return {
    name: `app/containment ${files.join(' ')}`,
    files,
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: forbidden.map((lib) => ({
            regex: `^${lib}(?:/|$)`,
            message: `${lib} is contained to one layer (spec 2); see eslint.config.ts.`,
          })),
        },
      ],
    },
  }
}

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores([
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    'playwright-report/**',
    'test-results/**',
  ]),

  ...pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommendedTypeChecked,

  {
    name: 'app/imports',
    plugins: { 'import-x': pluginImportX, 'simple-import-sort': pluginSimpleImportSort },
    settings: { 'import-x/resolver-next': [createTypeScriptImportResolver()] },
    rules: {
      'import-x/no-cycle': 'error',
      'import-x/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['**/__tests__/**', 'e2e/**', 'src/mocks/**', '*.config.ts'] },
      ],
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },

  {
    name: 'app/layers',
    files: ['src/**/*.{ts,vue}'],
    ignores: ['src/**/__tests__/**'],
    rules: { 'import-x/no-restricted-paths': ['error', { zones: layerZones }] },
  },

  restrictImports(['src/**/*.{ts,vue}'], []),
  restrictImports(['src/services/http.ts'], ['axios']),
  restrictImports(['src/components/base/**'], ['reka-ui', '@lucide/vue']),
  restrictImports(['src/mocks/**'], ['msw']),
  restrictImports(['src/plugins/sentry.ts'], ['@sentry/vue']),
  restrictImports(['src/schemas/**', 'src/types/**', 'src/utils/**'], [], vueLibraries),
  restrictImports(['src/**/__tests__/**'], ['msw']),

  {
    name: 'app/templates',
    files: ['**/*.vue'],
    rules: {
      'vue/no-v-html': 'error',
      'vue/no-restricted-class': ['error', ...physicalDirectionClasses],
    },
  },

  {
    name: 'app/mock-markers',
    rules: {
      'no-warning-comments': [
        isLaunchCheck ? 'error' : 'warn',
        { terms: ['MOCK:'], location: 'anywhere' },
      ],
    },
  },

  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
)
