import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Callout } from './callout'

const meta = {
  title: 'UI/Callout',
  component: Callout,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'note'],
    },
    title: { control: 'text' },
  },
} satisfies Meta<typeof Callout>

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Info',
    children: 'This is an informational callout with some helpful context.',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success',
    children: 'The operation completed successfully.',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    children: 'Be careful - this action cannot be undone.',
  },
}

export const Note: Story = {
  args: {
    variant: 'note',
    title: 'Note',
    children: 'A quick note to keep in mind as you proceed.',
  },
}

export const NoTitle: Story = {
  args: {
    variant: 'info',
    children: 'A callout without a title - just body content.',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-96">
      <Callout variant="info" title="Info">Informational content goes here.</Callout>
      <Callout variant="success" title="Success">Operation completed successfully.</Callout>
      <Callout variant="warning" title="Warning">Proceed with caution.</Callout>
      <Callout variant="note" title="Note">Something worth noting.</Callout>
    </div>
  ),
}
