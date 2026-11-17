import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

// ESLint 9 flat config: 빌드 결과물(dist)은 검사하지 않는다
export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      // JSX에서 쓰는 컴포넌트(대문자로 시작)는 '안 쓰는 변수'로 보지 않는다
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      // React Hooks 규칙
      ...reactHooks.configs.recommended.rules,
      // Vite 빠른 새로고침 규칙
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // vite.config.js는 브라우저가 아니라 Node에서 실행된다
    files: ['vite.config.js'],
    languageOptions: { globals: globals.node },
  },
]
