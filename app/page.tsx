'use client'

import { useState, useCallback, useMemo } from 'react'
import { Sparkles } from 'lucide-react'
import { MenuItem, MenuTableItem, ProcessingStatus } from '@/types'
import { extractMenuFromImages } from '@/lib/gemini'
import { Logo } from '@/components/logo'
import { ImageUploader } from '@/components/image-uploader'
import { MenuTable } from '@/components/menu-table'
import { MarkupSelector } from '@/components/markup-selector'
import { ProcessingIndicator } from '@/components/processing-indicator'
import { ErrorDisplay } from '@/components/error-display'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE)
  const [error, setError] = useState<string | null>(null)
  const [markupPercent, setMarkupPercent] = useState<number>(35)

  // Handle new files being added
  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles])

    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  // Remove a file by index
  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Process menu with AI
  const processMenu = useCallback(async () => {
    if (previews.length === 0) return

    setStatus(ProcessingStatus.ANALYZING)
    setError(null)

    try {
      const result = await extractMenuFromImages(previews)
      setMenuItems(result.items)
      setStatus(ProcessingStatus.SUCCESS)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发生意外错误'
      setError(errorMessage)
      setStatus(ProcessingStatus.ERROR)
    }
  }, [previews])

  // Reset to initial state
  const reset = useCallback(() => {
    setFiles([])
    setPreviews([])
    setMenuItems([])
    setStatus(ProcessingStatus.IDLE)
    setError(null)
  }, [])

  // Calculate table data with markup prices
  const tableData = useMemo<MenuTableItem[]>(() => {
    return menuItems.map(item => ({
      ...item,
      markupPrice: item.originalPrice * (1 + markupPercent / 100)
    }))
  }, [menuItems, markupPercent])

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-foreground pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/70 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-18 flex items-center justify-between py-3">
          <Logo />
          {status !== ProcessingStatus.IDLE && (
            <Button
              variant="link"
              onClick={reset}
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              开始新分析
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {/* Introduction Text */}
        {status === ProcessingStatus.IDLE && (
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-foreground mb-4">秒级完成菜单数字化</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              上传菜单截图或照片。我们的 AI 将准确提取所有菜品名称和价格，
              并支持自定义设置溢价比例，即时生成结果。
            </p>
          </div>
        )}

        {/* Upload Area */}
        {status === ProcessingStatus.IDLE && (
          <>
            <ImageUploader
              previews={previews}
              onFilesChange={handleFilesChange}
              onRemove={handleRemoveFile}
            />

            {previews.length > 0 && (
              <div className="mt-10 flex justify-center">
                <Button
                  size="lg"
                  onClick={processMenu}
                  className="px-10 py-6 text-lg rounded-2xl font-bold shadow-xl shadow-primary/20 hover:-translate-y-1 transition-all active:scale-95"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  立即开始 AI 提取
                </Button>
              </div>
            )}
          </>
        )}

        {/* Processing State */}
        {status === ProcessingStatus.ANALYZING && (
          <ProcessingIndicator />
        )}

        {/* Error State */}
        {status === ProcessingStatus.ERROR && error && (
          <ErrorDisplay message={error} onRetry={reset} />
        )}

        {/* Success State - Results */}
        {status === ProcessingStatus.SUCCESS && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <MarkupSelector
              value={markupPercent}
              onChange={setMarkupPercent}
            />

            <MenuTable
              data={tableData}
              markupPercent={markupPercent}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-border py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-muted-foreground text-sm">
            © 2025 美团饿了么菜单助手. 基于自主研发技术驱动。
          </p>
        </div>
      </footer>
    </div>
  )
}
