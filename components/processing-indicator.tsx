'use client'

import { FileText } from 'lucide-react'

export function ProcessingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="w-8 h-8 text-primary" />
        </div>
      </div>
      <h3 className="mt-6 text-2xl font-bold text-foreground">AI 正在努力分析菜单...</h3>
      <p className="text-muted-foreground mt-2">正在精确转录菜品并提取价格信息。</p>
    </div>
  )
}
