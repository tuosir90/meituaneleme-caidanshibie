'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorDisplayProps {
  message: string
  onRetry: () => void
}

export function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-6 text-center">
      <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-destructive mb-2">提取失败</h3>
      <p className="text-destructive/80 mb-6">{message}</p>
      <Button
        variant="destructive"
        onClick={onRetry}
      >
        重试一次
      </Button>
    </div>
  )
}
