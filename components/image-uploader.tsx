'use client'

import { useCallback, useRef } from 'react'
import { Upload, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  previews: string[]
  onFilesChange: (files: File[]) => void
  onRemove: (index: number) => void
  className?: string
}

export function ImageUploader({
  previews,
  onFilesChange,
  onRemove,
  className
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files)
        onFilesChange(newFiles)
      }
      // Reset input to allow selecting the same file again
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    },
    [onFilesChange]
  )

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const files = Array.from(e.dataTransfer.files).filter(file =>
        file.type.startsWith('image/')
      )

      if (files.length > 0) {
        onFilesChange(files)
      }
    },
    [onFilesChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <div className={cn('glass-card rounded-3xl p-8 shadow-2xl shadow-primary/10 border-primary/5', className)}>
      {/* Upload Zone */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex flex-col items-center justify-center border-2 border-dashed border-primary/20 rounded-2xl py-16 hover:border-primary/40 transition-all cursor-pointer bg-background group"
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <p className="text-lg font-semibold text-foreground">点击或拖拽上传菜单图片</p>
        <p className="text-muted-foreground text-sm mt-1">支持 PNG, JPG 或 WebP (最大 10MB)</p>
      </div>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            已选图片 ({previews.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {previews.map((src, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-xl overflow-hidden group shadow-md"
              >
                <img
                  src={src}
                  alt={`预览 ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemove(idx)
                  }}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {/* Add More Button */}
            <button
              onClick={handleClick}
              className="aspect-square border-2 border-dashed border-border rounded-xl flex items-center justify-center hover:bg-muted/50 transition-colors"
            >
              <Plus className="w-6 h-6 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
