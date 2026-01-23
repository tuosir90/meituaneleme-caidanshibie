import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '美团饿了么菜单整理批量上架 - 高端菜谱识别工具',
  description: '基于 Gemini 3 AI 技术驱动的菜单识别工具，秒级完成菜单数字化，支持自定义溢价比例',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
