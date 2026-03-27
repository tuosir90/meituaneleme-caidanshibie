import { NextRequest, NextResponse } from 'next/server'
import { resolveYunwuModel } from '@/lib/server/gemini-model.mjs'

interface GeminiImagePart {
  inlineData: {
    mimeType: string
    data: string
  }
}

interface GeminiTextPart {
  text: string
}

type GeminiPart = GeminiImagePart | GeminiTextPart

interface GeminiRequest {
  contents: Array<{
    parts: GeminiPart[]
  }>
  generationConfig?: {
    temperature?: number
    topP?: number
    responseMimeType?: string
  }
}

interface GeminiResponsePart {
  text?: string
  thought?: boolean
  thoughtSignature?: string
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      role?: string
      parts?: GeminiResponsePart[]
    }
  }>
}

const EXTRACTION_PROMPT = `请从提供的餐厅菜单图片中提取所有菜品名称及其价格。
返回结构化的项目列表。
确保名称与菜单中显示的完全一致。
价格应提取为数字。如果给出的是价格范围，请使用最低价格。
如果菜单有多个部分，请提取全部内容。

请以 JSON 格式返回，格式如下：
{
  "items": [
    { "name": "菜品名称", "originalPrice": 价格数字 }
  ]
}

注意：
1. 只返回 JSON 数据，不要包含其他文字
2. 价格必须是数字类型，不要包含货币符号
3. 如果无法识别价格，使用 0 作为默认值`

/**
 * Extract non-thought text from Gemini response parts
 */
function extractTextFromParts(parts: GeminiResponsePart[]): string {
  let text = ''
  console.log('Total parts:', parts.length)
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    console.log(`Part ${i}: thought=${part.thought}, hasSignature=${!!part.thoughtSignature}, textLength=${part.text?.length || 0}`)
    // Skip thought parts (model's internal reasoning) - but only if it's purely thought
    if (part.thought === true && !part.text?.includes('"items"')) {
      continue
    }
    // Skip parts with thoughtSignature (also internal reasoning)
    if (part.thoughtSignature && !part.text?.includes('"items"')) {
      continue
    }
    if (part.text) {
      text += part.text
    }
  }
  return text
}

/**
 * Extract JSON from text that may contain markdown code blocks
 */
function extractJsonFromText(text: string): string {
  // Try to find JSON in markdown code block first
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
  if (jsonBlockMatch) {
    return jsonBlockMatch[1].trim()
  }

  // Try to find any code block
  const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/)
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim()
  }

  // Try to find JSON object directly
  const jsonMatch = text.match(/\{[\s\S]*"items"[\s\S]*\}/)
  if (jsonMatch) {
    return jsonMatch[0]
  }

  return text.trim()
}

export async function POST(request: NextRequest) {
  // Read env vars inside function - use YUNWU_ prefix to avoid system env conflict
  const API_BASE = process.env.YUNWU_API_BASE || 'https://yunwu.ai/v1beta'
  const API_KEY = process.env.YUNWU_API_KEY || ''
  const MODEL_NAME = resolveYunwuModel()

  try {
    // Debug: log API key (first/last 4 chars only)
    console.log('API_KEY check:', API_KEY ? `${API_KEY.slice(0, 4)}...${API_KEY.slice(-4)}` : 'EMPTY')

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API Key 未配置，请检查环境变量' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { images } = body as { images: string[] }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: '请提供至少一张图片' },
        { status: 400 }
      )
    }

    // Build image parts for the request
    const imageParts: GeminiImagePart[] = images.map(base64 => {
      const base64Data = base64.includes(',') ? base64.split(',')[1] : base64

      let mimeType = 'image/jpeg'
      if (base64.startsWith('data:')) {
        const match = base64.match(/data:([^;]+);/)
        if (match) {
          mimeType = match[1]
        }
      }

      return {
        inlineData: {
          mimeType,
          data: base64Data
        }
      }
    })

    const requestBody: GeminiRequest = {
      contents: [{
        parts: [
          ...imageParts,
          { text: EXTRACTION_PROMPT }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        topP: 0.95
      }
    }

    // Use generateContent (non-streaming) endpoint for simpler response handling
    const apiUrl = `${API_BASE}/models/${MODEL_NAME}:generateContent?key=${API_KEY}`
    console.log('Calling API:', apiUrl.replace(API_KEY, '***'))

    // Create AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minutes timeout

    let response: Response
    try {
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })
    } finally {
      clearTimeout(timeoutId)
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('API Error Response:', errorText)
      return NextResponse.json(
        { error: `API 请求失败: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }

    // Handle response
    const responseText = await response.text()
    console.log('Raw response length:', responseText.length)
    console.log('Raw response (first 1000 chars):', responseText.substring(0, 1000))

    // Collect all text from response, skipping thought parts
    let fullText = ''

    // Parse as single JSON object (non-streaming response)
    try {
      const data: GeminiResponse = JSON.parse(responseText)
      const parts = data.candidates?.[0]?.content?.parts
      if (parts && Array.isArray(parts)) {
        fullText = extractTextFromParts(parts)
      }
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError)
      // Try to extract any JSON-like content from raw response
      const jsonMatch = responseText.match(/\{[\s\S]*"items"[\s\S]*\}/)
      if (jsonMatch) {
        fullText = jsonMatch[0]
      }
    }

    console.log('Extracted text (first 500 chars):', fullText.substring(0, 500))

    if (!fullText) {
      return NextResponse.json(
        { error: 'API 返回空结果，请尝试上传更清晰的图片' },
        { status: 500 }
      )
    }

    // Extract JSON from the text
    const jsonText = extractJsonFromText(fullText)
    console.log('JSON text (first 300 chars):', jsonText.substring(0, 300))

    let result: { items: Array<{ name: string; originalPrice: number }> }
    try {
      result = JSON.parse(jsonText)
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr, 'Text:', jsonText.substring(0, 500))
      return NextResponse.json(
        { error: '无法解析 API 返回的数据格式' },
        { status: 500 }
      )
    }

    if (!result.items || !Array.isArray(result.items)) {
      return NextResponse.json({ items: [] })
    }

    const menuItems = result.items.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      name: String(item.name || '未知菜品'),
      originalPrice: Number(item.originalPrice) || 0
    }))

    console.log('Successfully extracted', menuItems.length, 'menu items')
    return NextResponse.json({ items: menuItems })

  } catch (error) {
    console.error('Extract API Error:', error)

    let errorMessage = '服务器内部错误'
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'AI 处理超时，请尝试上传更小的图片或稍后重试'
      } else if (error.message.includes('fetch failed') || error.message.includes('socket')) {
        errorMessage = '网络连接失败，请检查网络后重试'
      } else {
        errorMessage = error.message
      }
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
