import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { InlineCode } from './inline-code'

const meta = {
  title: 'UI/InlineCode',
  component: InlineCode,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof InlineCode>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'const x = 1' },
}

export const InSentence: Story = {
  render: () => (
    <p className="text-sm text-content">
      Use <InlineCode>useState</InlineCode> to manage local component state.
    </p>
  ),
}

export const LongerSnippet: Story = {
  args: { children: 'npm install @armin/ui' },
}

export const WithSpecialCharacters: Story = {
  args: { children: '<div className="flex">' },
}
