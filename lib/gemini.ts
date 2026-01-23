import { ExtractionResult, MenuItem } from '@/types'

/**
 * Extract menu items from base64-encoded images using the server API
 * This function calls the Next.js API route which then calls the Gemini API
 */
export async function extractMenuFromImages(base64Images: string[]): Promise<ExtractionResult> {
  try {
    const response = await fetch('/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ images: base64Images })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `请求失败: ${response.status}`)
    }

    return {
      items: data.items as MenuItem[]
    }
  } catch (error) {
    console.error('Menu extraction error:', error)

    if (error instanceof Error) {
      throw error
    }

    throw new Error('无法提取菜单数据，请检查网络连接并重试')
  }
}
