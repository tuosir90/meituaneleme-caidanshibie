import * as XLSX from 'xlsx'
import ExcelJS from 'exceljs'
import { MenuTableItem } from '@/types'

export function exportMenuToExcel(data: MenuTableItem[], markupPercent: number) {
  // 定义列头
  const headers = [
    '分类名称',
    '菜品名称',
    '基础价格',
    `溢价后价格(${markupPercent}%)`,
    '当前库存',
    '每日库存'
  ]

  // 转换数据为二维数组
  const rows = data.map(item => [
    '新品上线',
    item.name,
    item.originalPrice.toFixed(2),
    item.markupPrice.toFixed(2),
    '50',
    '50'
  ])

  // 合并列头和数据
  const worksheetData = [headers, ...rows]

  // 创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

  // 设置列宽
  worksheet['!cols'] = [
    { wch: 12 },  // 分类名称
    { wch: 30 },  // 菜品名称
    { wch: 12 },  // 基础价格
    { wch: 18 },  // 溢价后价格
    { wch: 10 },  // 当前库存
    { wch: 10 }   // 每日库存
  ]

  // 创建工作簿
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '菜单数据')

  // 生成文件名（带时间戳）
  const timestamp = new Date().toISOString().slice(0, 10)
  const filename = `菜单数据_${timestamp}.xlsx`

  // 导出文件
  XLSX.writeFile(workbook, filename)
}

/**
 * 导出美团Excel - 将数据写入美团批量上架模板
 * 使用 exceljs 保持模板格式不变
 */
export async function exportMeituanExcel(data: MenuTableItem[]) {
  try {
    // 从 public 目录获取模板文件
    const response = await fetch('/美团批量上架模板.xlsx')
    if (!response.ok) {
      throw new Error('无法加载模板文件')
    }

    const arrayBuffer = await response.arrayBuffer()

    // 使用 exceljs 读取模板
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(arrayBuffer)

    // 获取"菜品录入"工作表
    const worksheet = workbook.getWorksheet('菜品录入')
    if (!worksheet) {
      throw new Error('找不到"菜品录入"工作表')
    }

    // 从第5行开始写入数据
    const startRow = 5

    data.forEach((item, index) => {
      const row = startRow + index

      // B列 - 分类名称
      worksheet.getCell(`B${row}`).value = '新品上线'

      // C列 - 商品名称
      worksheet.getCell(`C${row}`).value = item.name

      // E列 - 价格（溢价后价格）
      worksheet.getCell(`E${row}`).value = Number(item.markupPrice.toFixed(2))

      // F列 - 当前库存
      worksheet.getCell(`F${row}`).value = 50

      // G列 - 每日库存
      worksheet.getCell(`G${row}`).value = 50

      // H列 - 自动补足库存
      worksheet.getCell(`H${row}`).value = 1
    })

    // 生成文件并下载
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    // 生成文件名（带时间戳）
    const timestamp = new Date().toISOString().slice(0, 10)
    const filename = `美团批量上架_${timestamp}.xlsx`

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出美团Excel失败:', error)
    alert('导出失败: ' + (error instanceof Error ? error.message : '未知错误'))
  }
}
