import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: { children: 'Button', variant: 'primary' },
}

export const Secondary: Story = {
  args: { children: 'Button', variant: 'secondary' },
}

export const Ghost: Story = {
  args: { children: 'Button', variant: 'ghost' },
}

export const Outline: Story = {
  args: { children: 'Button', variant: 'outline' },
}

export const Small: Story = {
  args: { children: 'Button', size: 'sm' },
}

export const Large: Story = {
  args: { children: 'Button', size: 'lg' },
}

export const Disabled: Story = {
  args: { children: 'Button', disabled: true },
}

export const AsChild: Story = {
  args: { asChild: true },
  render: (args) => (
    <Button {...args}>
      <a href="/components">Link styled as button</a>
    </Button>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}
