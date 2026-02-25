'use client'

import { createContext } from 'react'

export const FormContext = createContext<{
  formData: { email: string; phone: string }
  setFormData: (v: { email: string; phone: string }) => void
} | null>(null)
