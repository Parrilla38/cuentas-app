import expoConfig from 'eslint-config-expo/flat.js'
import prettierConfig from 'eslint-config-prettier'

export default [
  ...expoConfig,
  prettierConfig,
  {
    rules: {
      'no-console': 'warn',
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    ignores: ['node_modules/', 'dist/', '.expo/', 'assets/', 'scripts/'],
  },
]
