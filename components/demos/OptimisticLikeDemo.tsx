'use client'

import { useState } from 'react'

export function OptimisticLikeDemo() {
  const [liked, setLiked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleLike = async () => {
    setLiked(true)
    setLoading(true)
    setMessage(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      setMessage('Saved.')
    } catch {
      setLiked(false)
      setMessage('Failed - rolled back.')
    } finally {
      setLoading(false)
    }
  }

  const handleUnlike = async () => {
    setLiked(false)
    setLoading(true)
    setMessage(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      setMessage('Saved.')
    } catch {
      setLiked(true)
      setMessage('Failed - rolled back.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4" style={{ color: 'hsl(var(--content-text))' }}>
      <div className="flex items-center gap-3">
        <span className="text-sm" style={{ color: 'hsl(var(--content-text-muted))' }}>
          Likes: {liked ? 1 : 0}
        </span>
        <button
          type="button"
          onClick={liked ? handleUnlike : handleLike}
          disabled={loading}
          className="px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-60"
          style={{
            backgroundColor: liked ? 'hsl(var(--link))' : 'hsl(var(--card-bg))',
            color: liked ? 'white' : 'hsl(var(--content-text))',
            border: '1px solid hsl(var(--content-border))',
          }}
        >
          {loading ? '…' : liked ? 'Liked' : 'Like'}
        </button>
      </div>
      {message && (
        <span className="text-xs" style={{ color: 'hsl(var(--content-text-muted))' }}>
          {message}
        </span>
      )}
      <p className="text-xs max-w-xs text-center" style={{ color: 'hsl(var(--content-text-muted))' }}>
        Button flips immediately (optimistic); request simulates 600ms. In production, failure would roll back.
      </p>
    </div>
  )
}
