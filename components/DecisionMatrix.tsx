'use client'

export function DecisionMatrix() {
  const patterns = [
    {
      name: 'Local State',
      coordination: 'Single component',
      persistence: 'None',
      boilerplate: 'Minimal',
      useWhen: 'Data only needed in one component, no sharing required',
      example: 'Toggle visibility, form input before submission',
    },
    {
      name: 'Lifted State',
      coordination: 'Parent + children',
      persistence: 'None',
      boilerplate: 'Low',
      useWhen: 'Sibling components need to coordinate',
      example: 'Tabs + tab panels, accordion items',
    },
    {
      name: 'URL State',
      coordination: 'Any component',
      persistence: 'Browser history',
      boilerplate: 'Medium',
      useWhen: 'State should be bookmarkable or shareable',
      example: 'Filters, search queries, pagination, selected item',
    },
    {
      name: 'Server State',
      coordination: 'Cross-page',
      persistence: 'Backend',
      boilerplate: 'Medium',
      useWhen: 'Data comes from API, needs caching/syncing',
      example: 'User profile, product catalog, comments',
    },
    {
      name: 'Global Client',
      coordination: 'App-wide',
      persistence: 'Custom (localStorage, etc.)',
      boilerplate: 'High',
      useWhen: 'Complex client-side coordination across many components',
      example: 'Shopping cart, notification system, theme with complex logic',
    },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm" style={{ borderColor: 'hsl(var(--content-border))' }}>
        <thead>
          <tr className="border-b-2" style={{ borderColor: 'hsl(var(--content-border))' }}>
            <th className="text-left p-3 font-bold" style={{ color: 'hsl(var(--content-text))' }}>Pattern</th>
            <th className="text-left p-3 font-bold" style={{ color: 'hsl(var(--content-text))' }}>Coordination</th>
            <th className="text-left p-3 font-bold" style={{ color: 'hsl(var(--content-text))' }}>Persistence</th>
            <th className="text-left p-3 font-bold" style={{ color: 'hsl(var(--content-text))' }}>Boilerplate</th>
            <th className="text-left p-3 font-bold" style={{ color: 'hsl(var(--content-text))' }}>Use When</th>
          </tr>
        </thead>
        <tbody>
          {patterns.map((pattern, index) => (
            <tr
              key={pattern.name}
              style={index % 2 === 0 ? { backgroundColor: 'hsl(var(--table-row-alt))' } : undefined}
            >
              <td className="p-3 font-medium align-top" style={{ color: 'hsl(var(--content-text))' }}>{pattern.name}</td>
              <td className="p-3 align-top" style={{ color: 'hsl(var(--content-text-muted))' }}>{pattern.coordination}</td>
              <td className="p-3 align-top" style={{ color: 'hsl(var(--content-text-muted))' }}>{pattern.persistence}</td>
              <td className="p-3 align-top" style={{ color: 'hsl(var(--content-text-muted))' }}>{pattern.boilerplate}</td>
              <td className="p-3 align-top" style={{ color: 'hsl(var(--content-text-muted))' }}>
                <div className="mb-1">{pattern.useWhen}</div>
                <div className="text-xs italic" style={{ color: 'hsl(var(--content-text-muted) / 0.9)' }}>Ex: {pattern.example}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
