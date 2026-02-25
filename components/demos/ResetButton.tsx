'use client'

interface ResetButtonProps {
  onReset: () => void
}

export function ResetButton({ onReset }: ResetButtonProps) {
  return (
    <button
      type="button"
      onClick={onReset}
      className="text-xs px-2.5 py-1.5 rounded border focus:outline-none focus:ring-2"
      style={{
        borderColor: 'hsl(var(--content-border))',
        color: 'hsl(var(--content-text-muted))',
      }}
    >
      Reset
    </button>
  )
}
