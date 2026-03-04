import jsxA11y from 'eslint-plugin-jsx-a11y'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['node_modules', '.next', 'storybook-static', 'dist'],
  },
  tseslint.configs.base,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ...jsxA11y.flatConfigs.recommended,
    settings: {
      'jsx-a11y': {
        components: {
          Button: 'button',
          InlineCode: 'code',
        },
      },
    },
  },
]
